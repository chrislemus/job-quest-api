import { z } from 'zod';

export const userRoleEnum = z.enum(['ADMIN', 'SUBSCRIBER']);
export type UserRoleEnum = z.input<typeof userRoleEnum>;
export type UserRoleDto = z.output<typeof userRoleEnum>;

export const UserDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: userRoleEnum,
  refreshToken: z.string().optional(),
});
export type UserDtoInput = z.input<typeof UserDto>;
export type UserDto = z.output<typeof UserDto>;

export const UserProfileResBodyDto = UserDto.omit({
  password: true,
  refreshToken: true,
});
export type UserProfileResBodyDtoInput = z.input<typeof UserProfileResBodyDto>;
export type UserProfileResBodyDto = z.output<typeof UserProfileResBodyDto>;
