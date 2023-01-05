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
import { JobLogService } from './job-log.service';
import { CreateJobLogDto } from './dto/create-job-log.dto';
import { UpdateJobLogDto } from './dto/update-job-log.dto';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  GetAuthUser,
} from '@app/common/decorators';
import { FindAllJobLogsQueryDto } from './dto';
import { JobLogEntity } from './entities/job-log.entity';
import { ApiPageResponse, Page } from '@app/common/pagination';

@Controller('job-log')
@ApiTags('job-log')
@ApiBearerAuth()
@ApiExtraModels(JobLogEntity)
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}

  @Post()
  @ApiCreatedResponse(JobLogEntity)
  create(
    @Body() createJobLogDto: CreateJobLogDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobLogEntity> {
    return this.jobLogService.create(createJobLogDto, userId);
  }

  @Get()
  @ApiPageResponse(JobLogEntity)
  findAll(
    @Query() findAllJobLogsQueryDto: FindAllJobLogsQueryDto,
    @GetAuthUser('id') userId: number,
  ): Promise<Page<JobLogEntity>> {
    return this.jobLogService.findAll(findAllJobLogsQueryDto, userId);
  }

  @Get(':id')
  @ApiOkResponse(JobLogEntity)
  findOne(
    @Param('id') id: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobLogEntity> {
    return this.jobLogService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOkResponse(JobLogEntity)
  update(
    @Param('id') id: number,
    @Body() updateJobLogDto: UpdateJobLogDto,
    @GetAuthUser('id') userId: number,
  ): Promise<JobLogEntity> {
    return this.jobLogService.update(id, updateJobLogDto, userId);
  }

  @Delete(':id')
  @ApiOkResponse(JobLogEntity)
  remove(
    @Param('id') id: number,
    @GetAuthUser('id') userId: number,
  ): Promise<JobLogEntity> {
    return this.jobLogService.remove(id, userId);
  }
}
