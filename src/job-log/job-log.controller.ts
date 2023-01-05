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
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAuthUser } from '@app/common/decorators';

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
