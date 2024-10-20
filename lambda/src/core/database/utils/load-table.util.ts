import { JobQuestDBService } from '../job-quest-db.service';
import { TCreateEntityItem } from '../types';

type TEntities = typeof JobQuestDBService.entities;

export type LoadTableOptions = {
  [Key in keyof TEntities as `${Key}s`]?: TCreateEntityItem<TEntities[Key]>[];
};

export async function loadTableUtil(options: LoadTableOptions) {
  const { users, jobLists, jobs } = options;

  for (const entry of Object.entries(options)) {
    const entityName = entry[0].slice(0, -1) as keyof TEntities;
    const entityService = JobQuestDBService.entities[entityName];

    type PutArgs = Parameters<typeof entityService.put>[0];
    const items = entry[1] as PutArgs;

    await entityService.put(items).go({ concurrency: 3 });
  }

  // if (users) {
  //   await JobQuestDBService.entities.user.put(users).go({ concurrency: 3 });
  // }

  // if (jobLists) {
  //   await JobQuestDBService.entities.jobList
  //     .put(jobLists)
  //     .go({ concurrency: 3 });
  // }

  // if (jobs) {
  //   await JobQuestDBService.entities.job.put(jobs).go({ concurrency: 3 });
  // }
}
