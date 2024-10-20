import jwt from 'jsonwebtoken';
import { AuthUserDto } from '@/features/user/dto';
import { JwtDto } from '../dto';
import { appConfig, hashValue } from '@/shared';
import { JobQuestDBService } from '@/core/database';
// import { userDB } from '@/shared/db/user-db.service';

/**  Generates Json Web Tokens */
export async function getTokens(user: AuthUserDto): Promise<JwtDto> {
  const authUser = AuthUserDto.parse(user);

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
  { id }: AuthUserDto,
  refreshTokenArg: string,
): Promise<void> {
  try {
    const refreshToken = await hashValue(refreshTokenArg);
    await JobQuestDBService.entities.user
      .patch({ userId: id })
      .set({ refreshToken })
      .go();
    // await userDB.update({ id, refreshToken });
  } catch (error) {
    const errMsg = 'Unable to sync refresh token w/ DB';
    console.error(errMsg, error);
    throw new Error(errMsg);
  }
}
// /**  Generates Json Web Tokens */
// export async function getTokens(user: AuthUserDto): Promise<JwtDto> {
//   const authUser = AuthUserDto.parse(user);

//   const { jwtSecret, jwtRefreshSecret, jwtAccessExpiry, jwtRefreshExpiry } =
//     appConfig;

//   const [accessToken, refreshToken] = await Promise.all([
//     jwt.sign(authUser, jwtSecret, { expiresIn: `${jwtAccessExpiry}` }),
//     jwt.sign(authUser, jwtRefreshSecret, { expiresIn: `${jwtRefreshExpiry}` }),
//   ]);

//   await syncRefreshToken(authUser, refreshToken);

//   return { accessToken, refreshToken };
// }

// /**  Sync refresh token with DB  persistence. */
// export async function syncRefreshToken(
//   { id }: AuthUserDto,
//   refreshTokenArg: string,
// ): Promise<void> {
//   try {
//     const refreshToken = await hashValue(refreshTokenArg);
//     await userDB.update({ id, refreshToken });
//   } catch (error) {
//     const errMsg = 'Unable to sync refresh token w/ DB';
//     console.error(errMsg, error);
//     throw new Error(errMsg);
//   }
// }
