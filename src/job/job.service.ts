import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  create(createJobDto: CreateJobDto) {
    return this.prisma.job.create({ data: createJobDto });
  }

  findAll() {
    return this.prisma.job.findMany();
  }

  findOne(id: number) {
    return this.prisma.job.findUnique({ where: { id } });
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
