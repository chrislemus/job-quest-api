import { Injectable } from '@nestjs/common';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';

@Injectable()
export class JobListService {
  create(createJobListDto: CreateJobListDto) {
    return 'This action adds a new jobList';
  }

  findAll() {
    return `This action returns all jobList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobList`;
  }

  update(id: number, updateJobListDto: UpdateJobListDto) {
    return `This action updates a #${id} jobList`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobList`;
  }
}
