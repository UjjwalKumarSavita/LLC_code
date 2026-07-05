import { ConflictException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import { Role, SkillLevel } from "../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const user = {
    id: "b58f9e9d-275a-4fb2-a82e-b1430bb6a334",
    email: "student@example.com",
    username: "student",
    fullName: "Student",
    role: Role.STUDENT,
    level: SkillLevel.BEGINNER,
    preferredLanguage: "python",
    isEmailVerified: false,
    createdAt: new Date("2026-01-01")
  };

  const prisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    refreshToken: {
      create: jest.fn()
    }
  };
  const jwt = {
    signAsync: jest
      .fn()
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token")
  };
  const config = {
    get: jest.fn((key: string, fallback: string) => {
      const values: Record<string, string> = {
        JWT_ACCESS_TTL: "15m",
        JWT_REFRESH_TTL: "7d"
      };
      return values[key] ?? fallback;
    }),
    getOrThrow: jest.fn((key: string) => `${key}-value-that-is-longer-than-32-characters`)
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService
    );
  });

  it("registers a student without returning its password hash", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.register({
      email: "Student@Example.com",
      username: "Student",
      password: "correct-horse-battery-staple",
      fullName: "Student"
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "student@example.com",
          username: "student",
          role: Role.STUDENT,
          passwordHash: expect.any(String)
        })
      })
    );
    expect(result).toMatchObject({
      user,
      accessToken: "access-token",
      refreshToken: "refresh-token"
    });
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it("rejects duplicate accounts", async () => {
    prisma.user.findFirst.mockResolvedValue({
      email: "student@example.com",
      username: "student"
    });

    await expect(
      service.register({
        email: "student@example.com",
        username: "student",
        password: "correct-horse-battery-staple"
      })
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
