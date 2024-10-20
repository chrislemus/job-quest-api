import { Service } from 'electrodb';
import { dbConfig } from './config';
import { JobRankEntityService } from './models/job-rank.model';
import { UserEntityService } from './models/user.model';
import { JobListEntityService } from './models/job-list.model';
import { JobEntityService } from './models/job.model';
import { _constraint } from './models/constraint.model';
import { JobLogEntityService } from './models/job-log.model';

const JobQuestDBService = new Service(
  {
    user: UserEntityService,
    jobList: JobListEntityService,
    job: JobEntityService,
    jobRank: JobRankEntityService,
    jobLog: JobLogEntityService,
    _constraint,
  },
  {
    ...dbConfig,
    // listeners: [
    //   (e) => {
    //     if (e.type === 'results') {
    //       console.log(e);
    //     }
    //   },
    // ],
  },
);
export { JobQuestDBService };
