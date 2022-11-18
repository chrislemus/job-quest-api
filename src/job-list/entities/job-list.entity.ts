import { JobList } from '@prisma/client';

export class JobListEntity implements JobList {
  /** Job List ID */
  id: number;
  /** Job List label */
  label: string;
  /** Order in which Job List should be displayed in UI */
  order: number;
  /** ID of the user who owns Job List */
  userId: number;
}
