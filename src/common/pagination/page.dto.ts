import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from './page-info.dto';

/** Generic paginated response */
export class Page<Record> {
  @ApiProperty()
  /** Requested data */
  data: Record[];
  @ApiProperty()
  /** Page info */
  pageInfo: PageInfo;
}
