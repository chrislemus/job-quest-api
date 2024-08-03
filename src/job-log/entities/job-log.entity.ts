export class JobLogEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  jobId: number;

  constructor(partial: JobLogEntity) {
    Object.assign(this, partial);
  }
}
