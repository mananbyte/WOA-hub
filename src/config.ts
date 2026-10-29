import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const developmentDatabaseUrl = "postgresql://postgres:postgrespassword@localhost:5432/woa_hub";
const developmentJwtSecret = "development-only-jwt-secret";

function getRequiredValue(name: "DATABASE_URL" | "JWT_SECRET"): string {
  const value = process.env[name];

  if (!value) {
    if (isProduction) {
      console.warn(
        `[CONFIG WARNING] Environment variable '${name}' is not set in production. ` +
        `Please configure '${name}' in your Vercel Project Settings -> Environment Variables.`
      );
    }
    return name === "DATABASE_URL" ? developmentDatabaseUrl : developmentJwtSecret;
  }

  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  databaseUrl: getRequiredValue("DATABASE_URL"),
  jwtSecret: getRequiredValue("JWT_SECRET"),
  isDatabaseConfigured: Boolean(process.env.DATABASE_URL),
  isJwtConfigured: Boolean(process.env.JWT_SECRET),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    : undefined,
};
