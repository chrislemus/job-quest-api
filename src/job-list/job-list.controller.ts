import { JobListService } from './job-list.service';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { ApiOkResponse, GetAuthUser } from '@app/common/decorators';
import { JobListEntity } from './entities/job-list.entity';
import { ApiPageResponse, Page, PaginatedQuery } from '@app/common/pagination';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  NotFoundException,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('job-list')
@ApiTags('job-list')
export class JobListController {
  constructor(private readonly jobListService: JobListService) {}

  @Post()
  @ApiConflictResponse()
  create(
    @Body() createJobListDto: CreateJobListDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    return this.jobListService.create(userId, createJobListDto);
  }

  @Get()
  @ApiPageResponse(JobListEntity)
  findAll(
    @Query() query: PaginatedQuery,
    @GetAuthUser('id') userId: number,
  ): Promise<Page<JobListEntity>> {
    return this.jobListService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOkResponse(JobListEntity)
  @ApiNotFoundResponse()
  async findOne(
    @Param('id') id: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    const jobList = await this.jobListService.findOne(id);
    if (jobList === null || jobList.userId !== userId)
      throw new NotFoundException();

    return jobList;
  }

  @Put(':id')
  async replaceJobList(
    @Param('id') jobListId: number,
    @GetAuthUser('id') userId: number,
    @Body() jobListDto: CreateJobListDto,
  ) {
    const jobList = await this.jobListService.replaceJobList(
      jobListId,
      userId,
      jobListDto,
    );
    if (jobList === null) throw new NotFoundException();
    return jobList;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListService.remove(+id);
  }
}
