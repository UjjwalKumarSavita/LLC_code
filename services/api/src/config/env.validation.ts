type Environment = Record<string, unknown>;

const required = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "WEB_ORIGIN"
] as const;

export function validateEnvironment(config: Environment) {
  for (const key of required) {
    const value = config[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const) {
    if ((config[key] as string).length < 32) {
      throw new Error(`${key} must contain at least 32 characters`);
    }
  }

  if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error("JWT access and refresh secrets must be different");
  }

  for (const key of ["DATABASE_URL", "REDIS_URL", "WEB_ORIGIN"] as const) {
    try {
      new URL(config[key] as string);
    } catch {
      throw new Error(`${key} must be a valid URL`);
    }
  }

  const webOrigin = new URL(config.WEB_ORIGIN as string);
  if (!["http:", "https:"].includes(webOrigin.protocol)) {
    throw new Error("WEB_ORIGIN must use http or https");
  }

  const port = Number(config.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port");
  }

  return {
    ...config,
    NODE_ENV: config.NODE_ENV ?? "development",
    PORT: port,
    JWT_ACCESS_TTL: config.JWT_ACCESS_TTL ?? "15m",
    JWT_REFRESH_TTL: config.JWT_REFRESH_TTL ?? "7d"
  };
}
