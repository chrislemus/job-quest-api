import { z } from 'zod';

export const authLoginReqBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type authLoginReqBodySchema = z.input<typeof authLoginReqBodySchema>;
export type authLoginReqBodyDto = z.output<typeof authLoginReqBodySchema>;
