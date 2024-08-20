import jwt from 'jsonwebtoken';
import { authUserSchema, AuthUserSchema } from '../../user/schemas';
import { JwtSchema } from '../schemas';
import { appConfig, hashValue } from '../../common';
import { UserDBService } from '../../db/user-db.service';

/**  Generates Json Web Tokens */
export async function getTokens(user: AuthUserSchema): Promise<JwtSchema> {
  const authUser = authUserSchema.parse(user);

  const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY,
  } = appConfig();

  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(authUser, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY }),
    jwt.sign(authUser, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY }),
  ]);

  await syncRefreshToken(authUser, refreshToken);

  return { accessToken, refreshToken };
}

/**  Sync refresh token with DB  persistence. */
export async function syncRefreshToken(
  { id }: AuthUserSchema,
  refreshTokenArg: string,
): Promise<void> {
  const userDB = new UserDBService();
  try {
    const refreshToken = await hashValue(refreshTokenArg);
    await userDB.update({ id, refreshToken });
  } catch (error) {
    const errMsg = 'Unable to sync refresh token w/ DB';
    console.error(errMsg, error);
    throw new Error(errMsg);
  }
}
