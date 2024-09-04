import { getExpAttrValues, removeCK } from './db-util';
import { jobListJobRankDB } from './job-list-job-rank-db.service';
import dbClient from './dynamo-db-document-client.service';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
  BatchGetCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from './types';
import { RequireFields } from '@/common/types';
import {
  appConfig,
  badRequestException,
  conflictException,
  notFoundException,
  uuid,
} from '@/common';
import {
  getJobCK,
  getJobCountCK,
  JobCK,
  getJobListCK,
} from './composite-key.util';

// const TableName = 'JobQuest-Job';

export type JobCount = {
  count: number;
};

type JobItem = Job & JobCK;

export type Job = {
  userId: string;
  id: string;
  jobListId: string;
  jobListRank: string;
  title: string;
  company: string;
  location?: string;
  url?: string;
  salary?: string;
  description?: string;
  color?: string;
};

async function totalJobCount(userId: string, allowCreate = true) {
  const TableName = appConfig.tableName;
  const Key = getJobCountCK({ userId });
  const AttributesToGet = ['count'];
  const command = new GetCommand({ TableName, Key, AttributesToGet });

  const data = (await dbClient().send(command)) as GetCommandOutput<JobCount>;

  if (!data.Item) {
    const errMsg = 'Failed to get job count';
    if (!allowCreate) throw notFoundException(errMsg);

    await createJobCount(userId);
    return totalJobCount(userId, false);
  }
  return data.Item.count;
}

function createJobCount(userId: string) {
  const TableName = appConfig.tableName;
  const jobCountCK = getJobCountCK({ userId });
  const Item = { ...jobCountCK, count: 0 };
  const ConditionExpression =
    'attribute_not_exists(pk) AND attribute_not_exists(sk)';
  const command = new PutCommand({ TableName, Item, ConditionExpression });
  return dbClient().send(command);
}

async function create(job: Omit<Job, 'id'>) {
  const TableName = appConfig.tableName;
  const createLimit = appConfig.jobCreateLimit;
  if (!createLimit) throw new Error('No createLimit');
  const JobCount = await totalJobCount(job.userId);

  if (JobCount >= createLimit) {
    throw conflictException(
      `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
    );
  }

  const { jobListId, jobListRank, userId } = job;
  const jobId = uuid();
  const jobCK = getJobCK({ userId, jobId });
  const jobItem: JobItem = { id: jobId, ...job, ...jobCK };

  const jobListJobRankPutCmdInput = jobListJobRankDB.putCmdInput({
    jobId,
    jobListId,
    jobListRank,
  });

  const jobListCK = getJobListCK({ userId, jobListId });

  const command = new TransactWriteCommand({
    TransactItems: [
      {
        Update: updateCountCmdInput(userId, 'increment'),
      },
      {
        Put: {
          TableName,
          Item: jobItem,
          ConditionExpression:
            'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        },
      },
      {
        Put: jobListJobRankPutCmdInput,
      },
      {
        ConditionCheck: {
          TableName,
          Key: jobListCK,
          ConditionExpression: `attribute_exists(pk) AND attribute_exists(sk)`,
        },
      },
    ],
  });

  await dbClient().send(command);
  return removeCK(jobItem);
}

function updateCountCmdInput(
  userId: string,
  action: 'increment' | 'decrement',
) {
  const TableName = appConfig.tableName;
  const jobCountCK = getJobCountCK({ userId });
  const operator = action === 'increment' ? '+' : '-';

  return {
    TableName,
    Key: jobCountCK,
    UpdateExpression: `SET #count = #count ${operator} :countAdd`,
    ExpressionAttributeValues: { ':countAdd': 1 },
    ExpressionAttributeNames: { '#count': 'count' },
  };
}

async function deleteJob(userId: string, jobId: string) {
  const TableName = appConfig.tableName;

  const jobCK = getJobCK({ userId, jobId });

  const getCmd = new GetCommand({
    TableName,
    Key: jobCK,
    AttributesToGet: ['jobListId', 'jobListRank'],
  });
  const data = (await dbClient().send(getCmd)) as GetCommandOutput<JobItem>;
  const { jobListId, jobListRank } = data.Item || {};
  if (!jobListId || !jobListRank) throw notFoundException();

  const deleteJobRankCmdInput = jobListJobRankDB.deleteCmdInput({
    jobListId,
    jobListRank,
  });

  const command = new TransactWriteCommand({
    TransactItems: [
      { Update: updateCountCmdInput(userId, 'decrement') },
      { Delete: { TableName, Key: jobCK } },
      { Delete: deleteJobRankCmdInput },
    ],
  });

  await dbClient().send(command);
  return dbClient().send(command) as Promise<DeleteCommandOutput<Job>>;
}

async function update(job: RequireFields<Partial<Job>, 'id' | 'userId'>) {
  const TableName = appConfig.tableName;

  const { id, userId, ...data } = job;
  if (!Object.keys(data).length) {
    throw badRequestException('No data to update');
  }

  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};
  const updateItems: string[] = [];
  Object.keys(data).forEach((key, idx) => {
    ExpressionAttributeNames[`#k${idx}`] = key;
    ExpressionAttributeValues[`:v${idx}`] = data[key];
    updateItems.push(`#k${idx} = :v${idx}`);
  });
  const UpdateExpression = `SET ${updateItems.join(', ')}`;

  type TxItems = NonNullable<TransactWriteCommandInput['TransactItems']>;
  type TxItem = TxItems[number];
  const Key = getJobCK({ userId, jobId: id });

  const jobUpdateCommandInput: TxItem['Update'] = {
    TableName,
    Key,
    ExpressionAttributeNames,
    UpdateExpression,
    ExpressionAttributeValues,
  };

  if (data.jobListId || data.jobListRank) {
    const TransactItems: TransactWriteCommandInput['TransactItems'] = [
      { Update: jobUpdateCommandInput },
    ];

    const res = await getUnique(userId, id);

    if (data.jobListRank && data.jobListId) {
      const jobListRankMismatch = res.jobListRank !== data.jobListRank;
      const jobListIdMismatch = res.jobListId !== data.jobListId;
      if (jobListRankMismatch || jobListIdMismatch) {
        const JobListRankTransactItems = jobListJobRankDB.updateCmdInput(
          {
            jobId: res.id,
            jobListId: res.jobListId,
            jobListRank: res.jobListRank,
          },
          {
            jobListId: data.jobListId,
            jobListRank: data.jobListRank,
          },
        );

        TransactItems.push(...JobListRankTransactItems);
      }
    }

    const command = new TransactWriteCommand({ TransactItems });
    return dbClient().send(command) as Promise<PutCommandOutput<Job>>;
  }

  const command = new UpdateCommand(jobUpdateCommandInput);
  return dbClient().send(command) as Promise<PutCommandOutput<Job>>;
}

async function getUnique(userId: string, jobId: string): Promise<Job> {
  const Key = getJobCK({ userId, jobId });
  const TableName = appConfig.tableName;

  const command = new GetCommand({ TableName, Key });
  const data = (await dbClient().send(command)) as GetCommandOutput<JobItem>;

  if (!data.Item) throw notFoundException();

  const job = removeCK(data.Item);
  return job;
}

async function findAll(userId: string) {
  const TableName = appConfig.tableName;

  const jobCK = getJobCK({ userId, jobId: '' });

  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: getExpAttrValues(jobCK),
  });
  return dbClient().send(command) as Promise<QueryCommandOutput<Job>>;
}

async function findAllByJobListId(userId: string, jobListId: string) {
  const TableName = appConfig.tableName;

  const jobListJobRanks = await jobListJobRankDB.findAll(jobListId);
  if (!(jobListJobRanks.length >= 1)) return [];
  const ExpressionAttributeValues = {};
  const KeyConditionExpressionList: string[] = [];
  jobListJobRanks.forEach((jobRank, idx) => {
    const jobCk = getJobCK({ userId, jobId: jobRank.jobId });
    ExpressionAttributeValues[`:pk${idx}`] = jobCk.pk;
    ExpressionAttributeValues[`:sk${idx}`] = jobCk.sk;
    KeyConditionExpressionList.push(`(pk = :pk${idx} AND sk = :sk${idx})`);
  });

  const command = new BatchGetCommand({
    RequestItems: {
      [TableName]: {
        Keys: jobListJobRanks.map((jobRank) => {
          const jobCK = getJobCK({ userId, jobId: jobRank.jobId });
          return jobCK;
        }),
      },
    },
  });
  const res = await dbClient().send(command);
  const jobs = (res?.Responses?.[TableName] || []) as Job[];
  return jobs;
}

export const jobDB = { findAll, create, findAllByJobListId, getUnique, update };
