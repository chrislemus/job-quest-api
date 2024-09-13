import { z } from 'zod';

export const AuthLoginReqBodyDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthLoginReqBodyDtoInput = z.input<typeof AuthLoginReqBodyDto>;
export type AuthLoginReqBodyDto = z.output<typeof AuthLoginReqBodyDto>;
