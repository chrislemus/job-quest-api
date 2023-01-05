import { JobLog as _JobLog } from '@prisma/client';

export class JobLogEntity implements _JobLog {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  jobId: number;

  constructor(partial: JobLogEntity) {
    Object.assign(this, partial);
  }
}
