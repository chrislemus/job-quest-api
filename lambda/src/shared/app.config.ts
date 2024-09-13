import { z } from 'zod';

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function minuteMs(minutes: number): number {
  return minutes * 60 * 1000;
}

const tableNameSchema = z.string();
const jwtSecretSchema = z.string();
const jwtRefreshSecretSchema = z.string();
const jwtAccessExpirySchema = z.number().default(minuteMs(20));
const jwtRefreshExpirySchema = z.number().default(dayMs(7));
const jobCreateLimitSchema = z.number().min(1).max(100).default(40);
const jobListCreateLimitSchema = z.number().min(1).max(50).default(10);

export const appConfig = {
  get tableName(): string {
    return tableNameSchema.parse(process.env.TABLE_NAME);
  },
  get jwtSecret(): string {
    return jwtSecretSchema.parse(process.env.JWT_SECRET);
  },
  get jwtRefreshSecret(): string {
    return jwtRefreshSecretSchema.parse(process.env.JWT_REFRESH_SECRET);
  },
  get jwtAccessExpiry(): number {
    return jwtAccessExpirySchema.parse(process.env.JWT_ACCESS_EXPIRY);
  },
  get jwtRefreshExpiry(): number {
    return jwtRefreshExpirySchema.parse(process.env.JWT_REFRESH_EXPIRY);
  },
  get jobCreateLimit(): number {
    return jobCreateLimitSchema.parse(process.env.JOB_CREATE_LIMIT);
  },
  get jobListCreateLimit(): number {
    return jobListCreateLimitSchema.parse(process.env.JOB_LIST_CREATE_LIMIT);
  },
};
