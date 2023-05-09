import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindAllJobsQueryDto } from './dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { LexoRank } from 'lexorank';
import { JobListDataService } from './job-list-data.service';

@Injectable()
export class JobService {
  private jobOrder = LexoRank;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jobListData: JobListDataService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: number): Promise<JobEntity> {
    const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');
    const userJobCount = await this.prisma.job.count({ where: { userId } });
    if (createLimit && userJobCount >= createLimit) {
      throw new ConflictException(
        `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
      );
    }
    const jobListData = await this.jobListData.getJobListData(
      createJobDto.jobList,
    );

    const jobList = await this.prisma.jobList.findUnique({
      where: { id: jobListData.jobListId },
      select: { userId: true },
    });

    if (jobList?.userId !== userId)
      throw new BadRequestException(
        `Cannot find Job List with ID '${jobListData.jobListId}'`,
      );

    const { jobList: _jobList, ...jodData } = createJobDto;

    const job = await this.prisma.job.create({
      data: {
        ...jodData,
        userId,
        jobListId: jobListData.jobListId,
        jobListRank: jobListData.jobListRank,
      },
    });

    return job;
  }

  findAll(
    findAllJobsQuery: FindAllJobsQueryDto,
    userId: number,
  ): Promise<Page<JobEntity>> {
    return pageQuery({
      pageConfig: findAllJobsQuery as any,
      queryFn: this.prisma.job.findMany,
      queryArgs: {
        where: {
          userId,
          AND: [
            {
              jobList: {
                OR: findAllJobsQuery.jobListId?.map((id) => ({ id })),
              },
            },
          ],
        },
        orderBy: { jobListRank: 'asc' },
      },
      countFn: this.prisma.job.count,
    });
  }

  async findOne(jobId: number, userId: number): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (job?.userId !== userId) throw new NotFoundException();
    return job;
  }

  async update(
    jobId: number,
    updateJobDto: UpdateJobDto,
    userId: number,
  ): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    if (job?.userId !== userId) throw new NotFoundException();
    const { jobList: _jobList, ...jodData } = updateJobDto;

    let jobListData:
      | undefined
      | {
          jobListRank: string;
          jobListId: number;
        };
    if (_jobList) {
      jobListData = await this.jobListData.getJobListData(_jobList);
    }

    const updatedJob = await this.prisma.job.update({
      data: {
        ...jodData,
        jobListId: jobListData?.jobListId,
        jobListRank: jobListData?.jobListRank,
      },
      where: { id: jobId },
    });

    return updatedJob;
  }

  async remove(jobId: number, userId: number): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    if (job?.userId !== userId) throw new NotFoundException();

    const deletedJOb = await this.prisma.job.delete({ where: { id: jobId } });
    return deletedJOb;
  }
}
