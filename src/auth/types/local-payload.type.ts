import { Role } from '@prisma/client';

export type LocalPayload = {
  id: number;
  email: string;
  role: Role;
};
