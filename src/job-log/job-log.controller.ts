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
import { SkipAuth } from '@app/auth/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAuthUser } from '@app/common/decorators';
import { FindAllJobLogsQueryDto } from './dto';

@Controller('job-log')
@ApiBearerAuth()
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}

  @Post()
  create(
    @Body() createJobLogDto: CreateJobLogDto,
    @GetAuthUser('id') userId: number,
  ) {
    return this.jobLogService.create(createJobLogDto, userId);
  }

  @Get()
  findAll(
    @Query() findAllJobLogsQueryDto: FindAllJobLogsQueryDto,
    @GetAuthUser('id') userId: number,
  ) {
    return this.jobLogService.findAll(findAllJobLogsQueryDto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetAuthUser('id') userId: number) {
    return this.jobLogService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateJobLogDto: UpdateJobLogDto,
    @GetAuthUser('id') userId: number,
  ) {
    return this.jobLogService.update(id, updateJobLogDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @GetAuthUser('id') userId: number) {
    return this.jobLogService.remove(id, userId);
  }
}
