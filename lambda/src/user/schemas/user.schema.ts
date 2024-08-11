import { z } from 'zod';

export const userRoleEnum = z.enum(['admin', 'user']);
export type UserRoleEnum = z.input<typeof userRoleEnum>;
export type UserRoleDto = z.output<typeof userRoleEnum>;

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: userRoleEnum,
});
export type UserSchema = z.input<typeof userSchema>;
export type UserDto = z.output<typeof userSchema>;

export const userProfileResBodySchema = userSchema.omit({ password: true });
export type UserProfileResBodySchema = z.input<typeof userProfileResBodySchema>;
export type UserProfileResBodyDto = z.output<typeof userProfileResBodySchema>;
