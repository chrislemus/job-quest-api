import { z } from 'zod';
import { UserDto } from '@/features/user/dto';
import { hashValue } from '@/shared';
import { userDB } from '@/shared/db/user-db.service';

export const AuthSignupReqBodyDto = z
  .object({
    firstName: UserDto.shape.firstName,
    lastName: UserDto.shape.lastName,
    password: UserDto.shape.password.transform(async (password) => {
      return await hashValue(password);
    }),
    email: UserDto.shape.email.superRefine(async (email, ctx) => {
      const code = z.ZodIssueCode.custom;
      try {
        const existingUser = await userDB.findByEmail(email);
        if (!!existingUser) {
          const message = 'User with this email already exists';
          ctx.addIssue({ code, message });
        }
      } catch (error) {
        console.error(error);
        const message = 'Error validating user email';
        ctx.addIssue({ code, message });
      }
      return z.NEVER;
    }),
  })
  .transform((data) => {
    const role = 'SUBSCRIBER' as const;
    return { ...data, role };
  });

export type AuthSignupReqBodyDtoInput = z.input<typeof AuthSignupReqBodyDto>;
export type AuthSignupReqBodyDto = z.output<typeof AuthSignupReqBodyDto>;
