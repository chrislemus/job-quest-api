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
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { UpdateJobListDto } from './dto/update-job-list.dto';
import { AuthUser } from '@app/auth/dto';

@ApiBearerAuth()
@Controller('job-list')
@ApiTags('job-list')
export class JobListController {
  constructor(private readonly jobListService: JobListService) {}

  @Post()
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
    @GetAuthUser() authUser: AuthUser,
  ): Promise<Page<JobListEntity>> {
    return this.jobListService.findAll(authUser.id, query);
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

  @Patch(':id')
  @ApiNotFoundResponse()
  async updateJobList(
    @Param('id') jobListId: number,
    @GetAuthUser('id') userId: number,
    @Body() jobListDto: UpdateJobListDto,
  ) {
    const jobList = await this.jobListService.updateJobList(
      jobListId,
      userId,
      jobListDto,
    );

    if (jobList === null) throw new NotFoundException();
    return jobList;
  }

  @Delete(':id')
  @ApiOkResponse(JobListEntity)
  async remove(
    @Param('id') jobListId: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobListEntity> {
    const deletedJobList = await this.jobListService.remove(jobListId, userId);
    if (deletedJobList === null) throw new NotFoundException();
    return deletedJobList;
  }
}
