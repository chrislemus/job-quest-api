import { Role } from './role.type';

export type LocalPayload = {
  id: string;
  email: string;
  role: Role;
};
