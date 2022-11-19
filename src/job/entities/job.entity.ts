import { Job } from '@prisma/client';

export class JobEntity implements Job {
  /** ID of the Job */
  id: number;
  /** Job Title */
  title: string;
  /** Job company */
  company: string;
  /** Job Location */
  location: string | null;
  /** Job post URL */
  url: string | null;
  /** Job salary */
  salary: string | null;
  /** Job description */
  description: string | null;
  /** Hexadecimal color to be used in UI when displaying job content */
  color: string | null;
  /** Job List ID where the Job links to */
  jobListId: number;
  /** ID of the User who owns this Job */
  userId: number;
}
