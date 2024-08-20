import { z } from 'zod';
import { userSchema } from './user.schema';

export const authUserSchema = userSchema.pick({
  id: true,
  email: true,
  role: true,
});

export type AuthUserSchema = z.input<typeof authUserSchema>;
export type AuthUserDto = z.output<typeof authUserSchema>;
