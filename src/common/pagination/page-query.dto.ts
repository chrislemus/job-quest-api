import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Allow, Min } from 'class-validator';

/** Paginated query parameters */
export class PaginatedQuery {
  @Allow()
  @Transform(({ value }) => +value)
  @ApiProperty({
    required: false,
    type: () => Number,
    description: 'Page to request',
  })
  @Min(1)
  /** Page to request */
  page = 1;

  @Allow()
  @Transform(({ value }) => +value)
  @ApiProperty({
    required: false,
    type: () => Number,
    description: 'Result page size',
  })
  /** Result page size */
  pageSize = 20;

  @Allow()
  @Transform(({ value }) => value === 'true' || value === true || false)
  @ApiProperty({
    required: false,
    type: () => Boolean,
    description:
      ' Get additional page information such as total page count and total item count',
  })
  /** Get additional page information such as total page count and total item count */
  pageTotalCount = false;
}
