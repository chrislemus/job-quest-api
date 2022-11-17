import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobListService } from './job-list.service';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse, GetAuthUser } from '@app/common/decorators';
import { JobListEntity } from './entities/job-list.entity';
import { ApiPageResponse, Page, PaginatedQuery } from '@app/common/pagination';

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
    @GetAuthUser('id') userId: number,
  ): Promise<Page<JobListEntity>> {
    return this.jobListService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOkResponse(JobListEntity)
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
  async update(
    @Param('id') id: string,
    @Body() updateJobListDto: UpdateJobListDto,
  ) {
    const jobList = await this.jobListService.update(+id, updateJobListDto);
    return jobList;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListService.remove(+id);
  }
}
