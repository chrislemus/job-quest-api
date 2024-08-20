import { AuthUserSchema } from '../../user/schemas';
import { JwtPayload as _JwtPayload } from 'jsonwebtoken';

export type JwtPayload = AuthUserSchema & Pick<_JwtPayload, 'iat' | 'exp'>;
