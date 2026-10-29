import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const developmentDatabaseUrl = "postgresql://postgres:postgrespassword@localhost:5432/woa_hub";
const developmentJwtSecret = "development-only-jwt-secret";

function getRequiredProductionValue(name: "DATABASE_URL" | "JWT_SECRET"): string {
  const value = process.env[name];

  if (isProduction && !value) {
    throw new Error(`${name} must be set when NODE_ENV=production`);
  }

  return value || (name === "DATABASE_URL" ? developmentDatabaseUrl : developmentJwtSecret);
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  databaseUrl: getRequiredProductionValue("DATABASE_URL"),
  jwtSecret: getRequiredProductionValue("JWT_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    : undefined,
};
