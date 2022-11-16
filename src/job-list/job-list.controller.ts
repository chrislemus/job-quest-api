import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
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
    // {
    //   "statusCode": 400,
    //   "message": [
    //     "label should not be empty",
    //     "label must be a string"
    //   ],
    //   "error": "Bad Request"
    // }
    return this.jobListService.create(userId, createJobListDto);
  }

  @Get()
  findAll() {
    // throw new Error('dewin');
    // {
    //   "statusCode": 500,
    //   "message": "Internal server error"
    // }
    // throw new InternalServerErrorException('dewoi');
    // {
    //   "statusCode": 500,
    //   "message": "dewoi",
    //   "error": "Internal Server Error"
    // }

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
