import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload, JwtPayloadWithRefreshToken } from '@app/auth/types';

// /** Extracts current authorized user data. */
export const AuthUser = createParamDecorator(
  (
    /** user property to access */
    prop: keyof JwtPayloadWithRefreshToken | undefined,
    context: ExecutionContext,
  ): JwtPayload[keyof JwtPayload] | JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    return prop ? user[prop] : user;
  },
);
