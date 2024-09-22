import { z } from 'zod';

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function minuteMs(minutes: number): number {
  return minutes * 60 * 1000;
}

const tableNameSchema = z.string({
  message: 'appconfig: tableName is required',
});
const jwtSecretSchema = z.string({
  message: 'appconfig: jwtSecret is required',
});
const jwtRefreshSecretSchema = z.string({
  message: 'appconfig: jwtRefreshSecret is required',
});
const DbUrlSchema = z.string({
  message: 'appconfig: Database url is required',
});
const jwtAccessExpirySchema = z.number().default(minuteMs(20));
const jwtRefreshExpirySchema = z.number().default(dayMs(7));
const jobCreateLimitSchema = z.number().min(1).max(100).default(40);
const jobListCreateLimitSchema = z.number().min(1).max(50).default(10);

// tableNameSchema.parse(process.env.TABLE_NAME);
export const appConfig = {
  get tableName(): string {
    return tableNameSchema.parse(process.env.TABLE_NAME);
  },
  get jwtSecret(): string {
    return jwtSecretSchema.parse(process.env.JWT_SECRET);
  },
  get DbUrl(): string {
    return DbUrlSchema.parse(process.env.DB_URL);
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
// export const appConfig = z
//   .object({
//     tableName: z.string(),
//     jwtSecret: z.string(),
//     jwtRefreshSecret: z.string(),
//     jwtAccessExpiry: z.number().default(minuteMs(20)),
//     jwtRefreshExpiry: z.number().default(dayMs(7)),
//     jobCreateLimit: z.number().min(1).max(100).default(40),
//     jobListCreateLimit: z.number().min(1).max(50).default(10),
//   })
//   .parse({
//     tableName: process.env.TABLE_NAME,
//     jwtSecret: process.env.JWT_SECRET,
//     jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
//     jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY,
//     jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY,
//     jobCreateLimit: process.env.JOB_CREATE_LIMIT,
//     jobListCreateLimit: process.env.JOB_LIST_CREATE_LIMIT,
//   });
