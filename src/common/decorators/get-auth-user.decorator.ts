import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/types';
import { AuthUser } from 'src/auth/dto';

// /** Extracts authorized user jwt payload data. */
export const GetAuthUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    const { user } = request;
    return data ? user?.[data] : user;
  },
);
