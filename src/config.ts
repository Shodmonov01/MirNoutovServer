import dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  BOT_TOKEN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
  R2_BUCKET: string;
  R2_PUBLIC_URL: string;
  CORS_ORIGIN: string;
}

const required = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing env variable: ${key}`);
  }
  return value;
};

const optional = (key: string, defaultValue: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

const optionalPort = (key: string, defaultValue: number): number => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') {
    return defaultValue;
  }
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) {
    return defaultValue;
  }
  return n;
};

export const loadConfig = (): Config => ({
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: optionalPort('PORT', 3000),
  MONGODB_URI: required('MONGODB_URI'),
  BOT_TOKEN: required('BOT_TOKEN'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  R2_ENDPOINT: required('R2_ENDPOINT'),
  R2_ACCESS_KEY: required('R2_ACCESS_KEY'),
  R2_SECRET_KEY: required('R2_SECRET_KEY'),
  R2_BUCKET: required('R2_BUCKET'),
  R2_PUBLIC_URL: required('R2_PUBLIC_URL').replace(/\/$/, ''),
  CORS_ORIGIN: required('CORS_ORIGIN'),
});

export type { Config };
