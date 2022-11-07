import { AuthUser } from '../dto';

/**
 * Authorized user with refresh token.
 * {@link JwtRefreshAuthGuard} has injected the refresh token
 */
export type AuthUserWithRefreshToken = AuthUser & { refreshToken: string };
