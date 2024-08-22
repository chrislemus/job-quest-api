import jwt from 'jsonwebtoken';
import { authUserSchema, AuthUserSchema } from '@/user/schemas';
import { JwtSchema } from '../schemas';
import { appConfig, hashValue } from '@/common';
import { userDB } from '@/db/user-db.service';

/**  Generates Json Web Tokens */
export async function getTokens(user: AuthUserSchema): Promise<JwtSchema> {
  const authUser = authUserSchema.parse(user);

  const { jwtSecret, jwtRefreshSecret, jwtAccessExpiry, jwtRefreshExpiry } =
    appConfig;

  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(authUser, jwtSecret, { expiresIn: `${jwtAccessExpiry}` }),
    jwt.sign(authUser, jwtRefreshSecret, { expiresIn: `${jwtRefreshExpiry}` }),
  ]);

  await syncRefreshToken(authUser, refreshToken);

  return { accessToken, refreshToken };
}

/**  Sync refresh token with DB  persistence. */
export async function syncRefreshToken(
  { id }: AuthUserSchema,
  refreshTokenArg: string,
): Promise<void> {
  try {
    const refreshToken = await hashValue(refreshTokenArg);
    await userDB.update({ id, refreshToken });
  } catch (error) {
    const errMsg = 'Unable to sync refresh token w/ DB';
    console.error(errMsg, error);
    throw new Error(errMsg);
  }
}
