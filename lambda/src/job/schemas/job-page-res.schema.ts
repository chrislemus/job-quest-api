import { createPageResSchema } from '../../pagination';
import { jobSchema } from './job.schema';

export const jobPageResSchema = createPageResSchema({ jobSchema });
