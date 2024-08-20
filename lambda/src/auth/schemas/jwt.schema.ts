import { z } from 'zod';

export const accessTokenSchema = z.string().min(5); // arbitrary;
export type AccessToken = z.input<typeof accessTokenSchema>;
export type AccessTokenDto = z.output<typeof accessTokenSchema>;

export const refreshTokenSchema = z.string().min(5); // arbitrary;
export type RefreshToken = z.input<typeof refreshTokenSchema>;
export type RefreshTokenDto = z.output<typeof refreshTokenSchema>;

export const jwtSchema = z.object({
  accessToken: accessTokenSchema,
  refreshToken: refreshTokenSchema,
});
export type JwtSchema = z.input<typeof jwtSchema>;
export type jwtSchemaDto = z.output<typeof jwtSchema>;
