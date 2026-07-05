import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import type {
  AccessTokenPayload,
  RefreshTokenPayload
} from "../common/auth.types";
import { Role } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      },
      select: { email: true, username: true }
    });
    if (existing) {
      throw new ConflictException(
        existing.email === email ? "Email is already registered" : "Username is unavailable"
      );
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id
    });
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName: dto.fullName?.trim(),
        role: Role.STUDENT
      },
      select: this.safeUserSelect
    });
    const tokens = await this.issueTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: {
        ...this.safeUserSelect,
        passwordHash: true,
        isActive: true
      }
    });
    if (!user?.passwordHash || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Invalid email or password");

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      level: user.level,
      preferredLanguage: user.preferredLanguage,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };
    const tokens = await this.issueTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  async refresh(rawToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(rawToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET")
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
    if (payload.type !== "refresh") throw new UnauthorizedException("Invalid refresh token");

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: {
        user: {
          select: {
            ...this.safeUserSelect,
            isActive: true
          }
        }
      }
    });
    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      !storedToken.user.isActive ||
      !(await argon2.verify(storedToken.tokenHash, rawToken))
    ) {
      throw new UnauthorizedException("Refresh token is expired or revoked");
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });
    const safeUser = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
      fullName: storedToken.user.fullName,
      role: storedToken.user.role,
      level: storedToken.user.level,
      preferredLanguage: storedToken.user.preferredLanguage,
      isEmailVerified: storedToken.user.isEmailVerified,
      createdAt: storedToken.user.createdAt
    };
    return this.issueTokens(safeUser);
  }

  async logout(rawToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(rawToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        ignoreExpiration: true
      });
      await this.prisma.refreshToken.updateMany({
        where: {
          id: payload.jti,
          userId: payload.sub,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });
    } catch {
      // Logout is intentionally idempotent and never reveals token validity.
    }
    return { success: true };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    username: string;
    role: Role;
  }) {
    const refreshId = crypto.randomUUID();
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access"
    };
    const refreshPayload: RefreshTokenPayload = {
      ...accessPayload,
      jti: refreshId,
      type: "refresh"
    };
    const accessTtl = this.config.get<string>("JWT_ACCESS_TTL", "15m");
    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL", "7d");
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessTtl as any
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshTtl as any
      })
    ]);

    await this.prisma.refreshToken.create({
      data: {
        id: refreshId,
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken, { type: argon2.argon2id }),
        expiresAt: new Date(Date.now() + parseDuration(refreshTtl))
      }
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl
    };
  }

  private readonly safeUserSelect = {
    id: true,
    email: true,
    username: true,
    fullName: true,
    role: true,
    level: true,
    preferredLanguage: true,
    isEmailVerified: true,
    createdAt: true
  } as const;
}

function parseDuration(value: string) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) throw new Error(`Unsupported token duration: ${value}`);
  const amount = Number(match[1]);
  const multiplier = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    match[2] as "s" | "m" | "h" | "d"
  ];
  return amount * multiplier;
}
