import { JobService } from './job.service';
import { CreateJobDto, FindAllJobsQueryDto, UpdateJobDto } from './dto';
import { JobEntity } from './entities';
import { ApiPageResponse, Page } from '@app/common/pagination';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  GetAuthUser,
} from '@app/common/decorators';

@Controller('job')
@ApiTags('job')
@ApiBearerAuth()
@ApiExtraModels(JobEntity)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /** Create a new Job */
  @Post()
  @ApiCreatedResponse(JobEntity)
  @ApiBadRequestResponse()
  create(
    @Body() createJobDto: CreateJobDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobEntity> {
    return this.jobService.create(createJobDto, userId);
  }

  /** Get all Jobs */
  @Get()
  @ApiPageResponse(JobEntity)
  findAll(
    @Query() findAllJobsQuery: FindAllJobsQueryDto,
    @GetAuthUser('id') userId: number,
  ): Promise<Page<JobEntity>> {
    return this.jobService.findAll(findAllJobsQuery, userId);
  }

  /** Get Job by ID */
  @ApiOkResponse(JobEntity)
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobEntity> {
    return this.jobService.findOne(id, userId);
  }

  /** Update Job data */
  @Patch(':id')
  @ApiOkResponse(JobEntity)
  update(
    @Param('id') id: number,
    @Body() updateJobDto: UpdateJobDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobEntity> {
    return this.jobService.update(id, updateJobDto, userId);
  }

  /** Delete a Job */
  @Delete(':id')
  @ApiOkResponse(JobEntity)
  remove(
    @Param('id') jobId: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobEntity> {
    return this.jobService.remove(jobId, userId);
  }
}
