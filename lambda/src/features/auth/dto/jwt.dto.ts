import { z } from 'zod';

export const AccessTokenDto = z.string().min(5); // arbitrary;
export type AccessTokenDtoInput = z.input<typeof AccessTokenDto>;
export type AccessTokenDto = z.output<typeof AccessTokenDto>;

export const RefreshTokenDto = z.string().min(5); // arbitrary;
export type RefreshTokenDtoInput = z.input<typeof RefreshTokenDto>;
export type RefreshTokenDto = z.output<typeof RefreshTokenDto>;

export const JwtDto = z.object({
  accessToken: AccessTokenDto,
  refreshToken: RefreshTokenDto,
});
export type JwtDtoInput = z.input<typeof JwtDto>;
export type JwtDto = z.output<typeof JwtDto>;
