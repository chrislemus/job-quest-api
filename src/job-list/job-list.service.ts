import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Page, PaginatedQuery } from 'src/common/pagination';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListEntity } from './entities/job-list.entity';
import { JobListDBService } from 'src/db/job-list-db.service';

@Injectable()
export class JobListService {
  constructor(private jobListDB: JobListDBService) {}

  /** Create a Job List */
  async create(
    createJobListDto: CreateJobListDto,
    userId: string,
  ): Promise<JobListEntity> {
    const { label } = createJobListDto;
    const jobList = await this.jobListDB.create({ label, userId });
    if (!jobList) throw new InternalServerErrorException();
    return jobList;
  }

  /** Find all Job Lists that belongs to a user */
  async findAll(
    query: PaginatedQuery,
    userId: string,
  ): Promise<Page<JobListEntity>> {
    const data = await this.jobListDB.findAll(userId);

    return {
      data,
      pageInfo: {
        currentPage: 0,
        currentPageSize: 0,
        currentPageCount: 0,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<JobListEntity> {
    const jobList = await this.jobListDB.queryUnique(userId, id);
    if (!jobList) throw new NotFoundException();
    return jobList;
  }

  /** Update a Job List */
  async updateJobList(
    jobListId: string,
    jobListDto: UpdateJobListDto,
    userId: string,
  ): Promise<JobListEntity> {
    const updatedJobList = await this.jobListDB.update({
      id: jobListId,
      userId,
      label: jobListDto.label,
    });

    if (!updatedJobList) throw new NotFoundException();
    return updatedJobList;
  }

  /** Remove a Job List */
  async remove(jobListId: string, userId: string): Promise<string> {
    // const jobList = await this.prisma.jobList.findUnique({
    //   where: { id: jobListId },
    //   select: { userId: true },
    // });
    throw new InternalServerErrorException('Not implemented');
    // await this.jobListDB.delete(userId, jobListId);

    // if (jobList?.userId !== userId) throw new NotFoundException();

    // const res = await this.prisma.jobList.delete({ where: { id: jobListId } });
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    // todo: check if jobs are linked to this job list
    return jobListId;
  }
}
