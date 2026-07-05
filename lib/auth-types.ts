export type UserRole =
  | "STUDENT"
  | "MENTOR"
  | "CONTENT_WRITER"
  | "REVIEWER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  role: UserRole;
  level?: string;
  preferredLanguage?: string;
  isEmailVerified?: boolean;
};

export type AuthPayload = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export const CMS_ROLES: UserRole[] = [
  "CONTENT_WRITER",
  "REVIEWER",
  "ADMIN",
  "SUPER_ADMIN",
];

export function canAccessCms(role: UserRole | undefined) {
  return Boolean(role && CMS_ROLES.includes(role));
}
