import { PrismaService } from '@app/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JobList } from '@prisma/client';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';
import { JobListEntity } from './entities/job-list.entity';

@Injectable()
export class JobListService {
  private logger = new Logger(JobListService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createJobListDto: CreateJobListDto,
  ): Promise<JobListEntity> {
    try {
      let newJobListOrder: undefined | number = createJobListDto?.order;

      if (!newJobListOrder) {
        const lastJobList = await this.prisma.jobList.findFirst({
          orderBy: { order: 'desc' },
          select: { order: true },
        });

        newJobListOrder = lastJobList.order + 1;
      }

      const jobList = await this.prisma.jobList.create({
        data: {
          label: createJobListDto.label,
          ownerId: userId,
          order: newJobListOrder,
        },
      });

      return jobList;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async findAll(): Promise<JobListEntity[]> {
    try {
      const jobLists = await this.prisma.jobList.findMany();
      return jobLists;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
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
