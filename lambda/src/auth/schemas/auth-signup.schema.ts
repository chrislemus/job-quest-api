import { z } from 'zod';
import { userSchema } from '../..//user/schemas/user.schema';

export const authSignupReqBodySchema = z.object({
  email: userSchema.shape.email,
  password: userSchema.shape.password,
  firstName: userSchema.shape.firstName,
  lastName: userSchema.shape.lastName,
});

export type authSignupSchema = z.input<typeof authSignupReqBodySchema>;
export type AuthSignupDto = z.output<typeof authSignupReqBodySchema>;
