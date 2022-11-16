import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JobListService } from './job-list.service';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetAuthUser } from '@app/common/decorators';
import { AuthUser } from '@app/auth/dto';
import { JobListEntity } from './entities/job-list.entity';

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
  findAll() {
    return this.jobListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobListDto: UpdateJobListDto) {
    return this.jobListService.update(+id, updateJobListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListService.remove(+id);
  }
}
