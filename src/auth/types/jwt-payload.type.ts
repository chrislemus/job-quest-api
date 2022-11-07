/** User JWT payload data */
export type JwtPayload = {
  /** Subject (user id) */
  sub: number;
  email: string;
  /** Issued At */
  iat: number;
  /** Expiration time */
  exp: number;
};
