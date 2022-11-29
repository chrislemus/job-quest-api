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

  constructor(
    paginatedData: Page<Record>,
    dataSerializer?: { new (partial: Record): Record },
  ) {
    let { data } = paginatedData;
    if (data && dataSerializer) {
      data = data.map((item) => {
        return new dataSerializer(item);
      });
    }

    const { pageInfo } = paginatedData;
    this.pageInfo = pageInfo;
    this.data = data;
  }
}
