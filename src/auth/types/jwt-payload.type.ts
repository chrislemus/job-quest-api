import { Role } from './role.type';

/** User JWT payload data */
export type JwtPayload = {
  /** user id */
  id: string;
  email: string;
  /** Issued At */
  iat: number;
  /** Expiration time */
  exp: number;
  /** User role */
  role: Role;
};
