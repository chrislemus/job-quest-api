import { z } from 'zod';
import { UserDto } from './user.dto';

export const AuthUserDto = UserDto.pick({
  id: true,
  email: true,
  role: true,
});

export type AuthUserDtoInput = z.input<typeof AuthUserDto>;
export type AuthUserDto = z.output<typeof AuthUserDto>;
