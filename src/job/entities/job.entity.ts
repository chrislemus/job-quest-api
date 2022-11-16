import { Job } from '@prisma/client';

export class JobEntity implements Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  salary: string | null;
  description: string | null;
  color: string | null;
  jobListId: number;
}
