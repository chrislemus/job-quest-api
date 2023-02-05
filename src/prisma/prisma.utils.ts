import { PrismaClient } from '@prisma/client';

export function getTableNames(client: PrismaClient) {
  // extract table names
  // https://www.prisma.io/docs/concepts/components/prisma-client/crud#deleting-all-data-with-raw-sql--truncate
  return client.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`.then(
    (tablenames) => {
      return tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations');
    },
  );
}
