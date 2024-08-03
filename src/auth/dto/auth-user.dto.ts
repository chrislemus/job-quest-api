import { Role } from '../types';

export class AuthUser {
  /** user id (same as sub but explicit) */
  id: string;
  /** user email */
  email: string;
  /** user role */
  role: Role;
}
