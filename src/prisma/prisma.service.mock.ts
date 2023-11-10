import type { PrismaService } from './prisma.service';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(prismaServiceMock);
});

export const prismaServiceMock = mockDeep<PrismaService>();
// console.log(prismaServiceMock.job.findFirst);
export type PrismaServiceMock = typeof prismaServiceMock;
