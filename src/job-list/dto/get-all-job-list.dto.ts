import { PaginatedQuery } from '@app/common/pagination';

export class GetAllJobListsDto extends PaginatedQuery {
  /** Retrieve data for all users (query restricted based on `user.role`)  */
  getAll?: number;
}
