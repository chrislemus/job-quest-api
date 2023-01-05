import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JobLogService } from './job-log.service';
import { CreateJobLogDto } from './dto/create-job-log.dto';
import { UpdateJobLogDto } from './dto/update-job-log.dto';
import { SkipAuth } from '@app/auth/decorators';

@Controller('job-log')
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}

  @Post()
  create(@Body() createJobLogDto: CreateJobLogDto) {
    return this.jobLogService.create(createJobLogDto);
  }

  @Get()
  @SkipAuth()
  findAll() {
    return this.jobLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobLogDto: UpdateJobLogDto) {
    return this.jobLogService.update(+id, updateJobLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobLogService.remove(+id);
  }
}
