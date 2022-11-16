import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';

@Controller('job-list')
export class JobListController {
  constructor(private readonly jobListService: JobListService) {}

  @Post()
  create(@Body() createJobListDto: CreateJobListDto) {
    return this.jobListService.create(createJobListDto);
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
