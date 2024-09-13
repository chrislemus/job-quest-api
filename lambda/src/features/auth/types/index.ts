import { AuthUserDto } from '@/features/user/dto';
import { JwtPayload as _JwtPayload } from 'jsonwebtoken';

export type JwtPayload = AuthUserDto & Pick<_JwtPayload, 'iat' | 'exp'>;
