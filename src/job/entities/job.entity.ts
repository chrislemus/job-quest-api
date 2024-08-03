export class JobEntity {
  /** ID of the Job */
  id: string;
  /** Job Title */
  title: string;
  /** Job company */
  company: string;
  /** Job Location */
  location?: string;
  /** Job post URL */
  url?: string;
  /** Job salary */
  salary?: string;
  /** Job description */
  description?: string;
  /** Hexadecimal color to be used in UI when displaying job content */
  color?: string;
  /** Job list rank */
  jobListRank: string;
  /** Job List ID where the Job links to */
  jobListId: string;
  /** ID of the User who owns this Job */
  userId: string;
}
