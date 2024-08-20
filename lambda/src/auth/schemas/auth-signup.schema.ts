import { z } from 'zod';
import { userSchema } from '../../user/schemas';
import { hashValue } from '../../common';
import { UserDBService } from '../../db/user-db.service';

export const authSignupReqBodySchema = z
  .object({
    firstName: userSchema.shape.firstName,
    lastName: userSchema.shape.lastName,
    password: userSchema.shape.password.transform(async (password) => {
      return await hashValue(password);
    }),
    email: userSchema.shape.email.superRefine(async (email, ctx) => {
      const userDB = new UserDBService();

      const code = z.ZodIssueCode.custom;
      try {
        const existingUser = await userDB.findByEmail(email);
        if (!!existingUser) {
          const message = 'User with this email already exists';
          ctx.addIssue({ code, message });
        }
      } catch (error) {
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

export type AuthSignupSchema = z.input<typeof authSignupReqBodySchema>;
export type AuthSignupDto = z.output<typeof authSignupReqBodySchema>;
