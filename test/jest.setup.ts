import { getTableNames } from '@app/prisma/prisma.utils';
import {
  hashUserMock,
  UserMock,
  adminUserMock as _adminUserMock,
  subscriberUserMock as _subscriberUserMock,
} from '@app/user/user.mocks';
import { PrismaClient } from '@prisma/client';

// const userMocks =
let adminUserMock: UserMock;
let subscriberUserMock: UserMock;
const prisma: PrismaClient = new PrismaClient();
let tablenames: string[];

// Establish API mocking before all tests.
beforeAll(async () => {
  await prisma.$connect();

  adminUserMock = await hashUserMock(_adminUserMock as UserMock);
  subscriberUserMock = await hashUserMock(_subscriberUserMock as UserMock);
  tablenames = await getTableNames(prisma);
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
beforeEach(async () => {
  const bb = await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tablenames
      .map((name) => `"${name}"`)
      .join(', ')} RESTART IDENTITY CASCADE;`,
  );
  // for (const tablename of tablenames) {
  //   console.log(tablename);
  //   const a = await prisma.$executeRawUnsafe(
  //     `ALTER SEQUENCE "${tablename}_id_seq" RESTART WITH 1;`,
  //   );
  //   console.log(a);
  // }
  await prisma.user.deleteMany({});
  await prisma.user.create({ data: adminUserMock });
  // prisma.user.up;
  await prisma.user.create({ data: subscriberUserMock });
});

// Clean up after the tests are finished.
afterAll(async () => {
  await prisma.$disconnect();
});
