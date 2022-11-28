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
    | PrismaService['user'],
  QueryFn extends BaseFn['findMany'],
  CountFn extends BaseFn['count'],
>(config: {
  /** Paginated query params */
  pageConfig: PaginatedQuery;
  /** Query argument for {@link queryFn } */
  queryArgs?: Omit<Parameters<QueryFn>[0], 'skip' | 'take'>;
  /** Query function that will return data  */
  queryFn: (args: Parameters<QueryFn>[0]) => Promise<ReturnT[]>;
  /** Count function that returns the data count */
  countFn: (args: Parameters<CountFn>[0]) => Promise<number>;
}): Promise<Page<ReturnT>> => {
  const { page, pageSize, pageTotalCount } = config.pageConfig;
  if (!config.queryArgs) config.queryArgs = {} as any; // avoid error when user {...res}

  // pass in query values and inject pagination config
  const jobListData = await config.queryFn({
    take: pageSize,
    skip: (page - 1) * pageSize,
    ...config.queryArgs,
  });

  // build page info object
  const pageInfo: PageInfo = {
    currentPage: page,
    currentPageSize: pageSize,
    currentPageCount: jobListData.length,
  };

  // if user wants page count, make a second call the the countFn() to retrieve data
  if (pageTotalCount) {
    const count = await config.countFn({ where: config.queryArgs?.where });
    pageInfo['totalPageCount'] = Math.ceil(count / pageSize);
    pageInfo['totalCount'] = count;
  }

  return {
    pageInfo,
    data: jobListData,
  };
};
