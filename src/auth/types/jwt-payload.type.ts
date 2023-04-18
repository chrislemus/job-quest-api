import { Role } from '@prisma/client';

/** User JWT payload data */
export type JwtPayload = {
  /** user id */
  id: number;
  email: string;
  /** Issued At */
  iat: number;
  /** Expiration time */
  exp: number;
  /** User role */
  role: Role;
};
