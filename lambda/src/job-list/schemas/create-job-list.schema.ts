import { jobListSchema } from '../{id}/schemas/job-list.schema';

export const createJobListSchema = jobListSchema.pick({ label: true });
