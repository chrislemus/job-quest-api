import { JobList } from '@prisma/client';

export class JobListEntity implements JobList {
  id: number;
  label: string;
  order: number;
  ownerId: number;
  constructor(partial: Partial<JobListEntity>) {
    Object.assign(this, partial);
  }
}
