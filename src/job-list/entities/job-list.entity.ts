export class JobListEntity {
  /** Job List ID */
  id: string;
  /** Job List label */
  label: string;
  /** Order in which Job List should be displayed in UI */
  order: number;
  /** ID of the user who owns Job List */
  userId: string;
}
