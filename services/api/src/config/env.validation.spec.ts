import { validateEnvironment } from "./env.validation";

describe("validateEnvironment", () => {
  const valid = {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/database",
    REDIS_URL: "redis://localhost:6379",
    JWT_ACCESS_SECRET: "access-secret-that-is-longer-than-32-characters",
    JWT_REFRESH_SECRET: "refresh-secret-that-is-longer-than-32-characters",
    WEB_ORIGIN: "http://localhost:3000"
  };

  it("applies safe defaults", () => {
    expect(validateEnvironment(valid)).toMatchObject({
      NODE_ENV: "development",
      PORT: 4000,
      JWT_ACCESS_TTL: "15m",
      JWT_REFRESH_TTL: "7d"
    });
  });

  it("rejects short signing secrets", () => {
    expect(() =>
      validateEnvironment({ ...valid, JWT_ACCESS_SECRET: "too-short" })
    ).toThrow("JWT_ACCESS_SECRET must contain at least 32 characters");
  });

  it("requires separate signing secrets", () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        JWT_REFRESH_SECRET: valid.JWT_ACCESS_SECRET
      })
    ).toThrow("JWT access and refresh secrets must be different");
  });

  it("rejects malformed service URLs", () => {
    expect(() =>
      validateEnvironment({ ...valid, REDIS_URL: "not a url" })
    ).toThrow("REDIS_URL must be a valid URL");
  });
});
