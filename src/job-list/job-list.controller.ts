import { JobListEntity } from './entities/job-list.entity';
import { ApiPageResponse, Page, PaginatedQuery } from '@app/common/pagination';
import { ApiBearerAuth, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListService } from './job-list.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  GetAuthUser,
} from '@app/common/decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';

@Controller('job-list')
@ApiTags('job-list')
@ApiBearerAuth()
export class JobListController {
  constructor(private readonly jobListService: JobListService) {}

  /** Create a new Job List */
  @Post()
  @ApiCreatedResponse(JobListEntity)
  create(
    @Body() createJobListDto: CreateJobListDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    return this.jobListService.create(createJobListDto, userId);
  }

  /** Get all Job Lists */
  @Get()
  @ApiPageResponse(JobListEntity)
  findAll(
    @Query() query: PaginatedQuery,
    @GetAuthUser('id') userId: number,
  ): Promise<Page<JobListEntity>> {
    return this.jobListService.findAll(query, userId);
  }

  /** Get Job List by ID */
  @Get(':id')
  @ApiOkResponse(JobListEntity)
  @ApiNotFoundResponse()
  async findOne(
    @Param('id') id: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    const jobList = await this.jobListService.findOne(id, userId);
    return jobList;
  }

  /** Update a Job List */
  @Patch(':id')
  @ApiNotFoundResponse()
  async updateJobList(
    @Param('id') jobListId: number,
    @GetAuthUser('id') userId: number,
    @Body() jobListDto: UpdateJobListDto,
  ): Promise<JobListEntity> {
    const jobList = await this.jobListService.updateJobList(
      jobListId,
      jobListDto,
      userId,
    );

    return jobList;
  }

  /** Delete a Job List */
  @Delete(':id')
  @ApiOkResponse(JobListEntity)
  @ApiNotFoundResponse()
  async remove(
    @Param('id') jobListId: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    const deletedJobList = await this.jobListService.remove(jobListId, userId);
    return deletedJobList;
  }
}
