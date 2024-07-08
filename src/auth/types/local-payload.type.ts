import { Role } from '@prisma/client';

export type LocalPayload = {
  id: string;
  email: string;
  role: Role;
};
