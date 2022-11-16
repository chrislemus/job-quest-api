import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';

@Injectable()
export class JobListService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createJobListDto: CreateJobListDto) {
    const userJobLists = await this.prisma.jobList.findFirst({
      orderBy: { order: 'asc' },
    });
    return userJobLists;
    // return this.prisma.jobList.create({
    //   data: { label: createJobListDto.label, ownerId: userId },
    // });
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
