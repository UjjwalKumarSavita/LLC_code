import type { Role } from "../generated/prisma/enums";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  jti: string;
  type: "refresh";
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: Role;
};
