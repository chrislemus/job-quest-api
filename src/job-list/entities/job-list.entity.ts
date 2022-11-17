import { JobList } from '@prisma/client';

export class JobListEntity implements JobList {
  id: number;
  label: string;
  order: number;
  userId: number;
}
