import { z } from 'zod';

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function minuteMs(minutes: number): number {
  return minutes * 60 * 1000;
}

const envVarsSchema = z.object({
  TABLE_NAME: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRY: z.number().default(minuteMs(20)),
  JWT_REFRESH_EXPIRY: z.number().default(dayMs(7)),
});

export const appConfig = () => envVarsSchema.parse(process.env);
