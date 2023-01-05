import { PrismaService } from '@app/prisma';
import { PageInfo } from './page-info.dto';
import { PaginatedQuery } from './page-query.dto';
import { Page } from './page.dto';

/** Wraps tha DB query and injects pagination parameters when calling DB with {@link Prisma} */
export const pageQuery = async <
  ReturnT,
  BaseFn extends
    | PrismaService['jobList']
    | PrismaService['job']
    | PrismaService['user']
    | PrismaService['jobLog'],
  QueryFn extends BaseFn['findMany'],
  CountFn extends BaseFn['count'],
>(config: {
  /**
   * Paginated query params
   */
  pageConfig: PaginatedQuery;
  /**
   * Query argument for {@link queryFn }
   */
  queryArgs?: Omit<Parameters<QueryFn>[0], 'skip' | 'take'>;
  /**
   * Query function that will return data
   */
  queryFn: (args: Parameters<QueryFn>[0]) => Promise<ReturnT[]>;
  /**
   * Count function that returns the data count
   */
  countFn: (args: Parameters<CountFn>[0]) => Promise<number>;
  /**
   * Serialize resource data.
   * - recommended when you what to transform or exclude properties from
   * each individual item (ie. remove password from user objects).
   * - This will serialize each item in the data property. But it
   * will not affect the `pageInfo` property
   *
   * @example
   * ```typescript
   * const pageObj = {
   *  pageInfo: {...}
   *  data: [{id: 1, password: qwerty}, {id: 2, password: qwerty}]
   * }
   *
   * // if `dataSerializer` is provided `pageObj` could be the following.
   *
   * pageObj = {
   *  pageInfo: {...}, // pageInfo remains the same
   *  data: [{id: 1, {id: 2}] // password excluded
   * }

   * ```
   */
  dataSerializer?: { new (partial: ReturnT): ReturnT };
}): Promise<Page<ReturnT>> => {
  const { page, pageSize, pageTotalCount } = config.pageConfig;
  if (!config.queryArgs) config.queryArgs = {} as any; // avoid error when user {...res}

  // pass in query values and inject pagination config
  const data = await config.queryFn({
    take: pageSize,
    skip: (page - 1) * pageSize,
    ...config.queryArgs,
  });

  // build page info object
  const pageInfo: PageInfo = {
    currentPage: page,
    currentPageSize: pageSize,
    currentPageCount: data.length,
  };

  // if user wants page count, make a second call the the countFn() to retrieve data
  if (pageTotalCount) {
    const count = await config.countFn({ where: config.queryArgs?.where });
    pageInfo['totalPageCount'] = Math.ceil(count / pageSize);
    pageInfo['totalCount'] = count;
  }

  return new Page({ pageInfo, data }, config.dataSerializer);
};
