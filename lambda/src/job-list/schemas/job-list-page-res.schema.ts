import { createPageResSchema } from '../../pagination';
import { jobListSchema } from '../{id}/schemas/job-list.schema';

export const jobListPageResSchema = createPageResSchema({ jobListSchema });
