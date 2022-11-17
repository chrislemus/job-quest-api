import { PaginatedQuery } from '@app/common/pagination';

export class GetAllJobListsDto extends PaginatedQuery {
  order?: number;
}
