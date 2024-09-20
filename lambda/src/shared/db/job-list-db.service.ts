import { RequireFields } from '@/shared/types';
import { getExpAttrValues, removeCK } from './db-util';
import { getJobListCK, JobListCK } from './composite-key.util';
import dbClient from './dynamo-db-document-client.service';
import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from './types';
import {
  appConfig,
  badRequestException,
  conflictException,
  uuid,
} from '@/shared';

type JobList = {
  userId: string;
  id: string;
  order: number;
  label: string;
};

type JobListItem = JobList & JobListCK;

async function create(
  jobList: Omit<JobList, 'id' | 'order'>,
): Promise<JobList> {
  const TableName = appConfig.tableName;
  const { label, userId } = jobList;
  const jobListId = uuid();
  const lastJobListId = await getLastJobListOrderNum(userId);
  throw new Error('Not implemented');
  // const order = lastJobListId ? lastJobListId + 1 : 1; // must start at index 1

  // // hard limit due to storage constraints
  // const { jobListCreateLimit } = appConfig;
  // if (order >= jobListCreateLimit) {
  //   throw conflictException(
  //     `Exceeded Job List limit (${jobListCreateLimit}). Consider deleting Job Lists to free up some space.`,
  //   );
  // }
  // const ck = getJobListCK({ userId, jobListId });
  // const Item: JobListItem = { order, label, userId, id: jobListId, ...ck };
  // const command = new PutCommand({ TableName, Item });
  // await dbClient().send(command);

  // return { order, label, id: jobListId, userId };
}

async function createMany(
  userId: string,
  jobListItems: Omit<JobList, 'userId' | 'id' | 'order'>[],
) {
  if (jobListItems.length === 0) throw badRequestException('No data');
  const lastJobListId = await getLastJobListOrderNum(userId);
  const startOrder = lastJobListId ? lastJobListId + 1 : 1; // must start at index 1
  const totalJobListItemsAfterCreate = startOrder + jobListItems.length;

  // hard limit due to storage constraints
  const { jobListCreateLimit } = appConfig;
  if (totalJobListItemsAfterCreate >= jobListCreateLimit) {
    throw conflictException(
      `Exceeded Job List limit (${jobListCreateLimit}). Consider deleting Job Lists to free up some space.`,
    );
  }

  const TransactItems: TransactWriteCommandInput['TransactItems'] = [];
  const TableName = appConfig.tableName;
  jobListItems.forEach(({ label }, idx) => {
    const order = startOrder + idx;
    const id = uuid();
    const ck = getJobListCK({ userId, jobListId: id });
    const Item: JobListItem = { order, label, id, userId, ...ck };
    TransactItems.push({ Put: { TableName, Item } });
  });

  const command = new TransactWriteCommand({ TransactItems });
  const res = await dbClient().send(command);

  return res;
}

async function getLastJobListOrderNum(userId: string): Promise<number | null> {
  const ck: JobListCK = getJobListCK({ userId, jobListId: '' });
  const ExpressionAttributeValues = getExpAttrValues(ck);
  const TableName = appConfig.tableName;
  const command = new QueryCommand({
    TableName,
    ScanIndexForward: true,
    ConsistentRead: true,
    KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
    ExpressionAttributeValues,
    Limit: 1,
  });

  const res = (await dbClient().send(command)) as QueryCommandOutput<JobList>;

  const jobListOrder = res.Items?.[0]?.order;
  return jobListOrder ?? null;
}

async function update(
  jobList: RequireFields<
    Partial<Pick<JobList, 'label' | 'id' | 'userId'>>,
    'id' | 'userId'
  >,
) {
  const { id, userId, ...data } = jobList;
  const Key: JobListCK = getJobListCK({ userId, jobListId: id });

  if (!Object.keys(data).length) {
    throw badRequestException('No data to update');
  }

  const ExpressionAttributeValues = {};
  let UpdateExpression = 'SET';
  for (const key in data) {
    ExpressionAttributeValues[`:${key}`] = data[key];
    UpdateExpression += ` ${key} = :${key},`;
  }
  if (UpdateExpression.endsWith(',')) {
    UpdateExpression = UpdateExpression.slice(0, -1);
  }
  const TableName = appConfig.tableName;
  const command = new UpdateCommand({
    TableName,
    Key,
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const { Attributes: updatedJobListRaw } = (await dbClient().send(
    command,
  )) as PutCommandOutput<Omit<JobList, 'userId' | 'id'> & JobListCK>;
  if (!updatedJobListRaw) {
    throw badRequestException('Job List not found');
  }
  const updatedJobList = removeCK(updatedJobListRaw);

  return { ...updatedJobList, id, userId };
}

async function jobListExist(
  userId: string,
  jobListId: string,
): Promise<boolean> {
  const Key: JobListCK = getJobListCK({ userId, jobListId });
  const TableName = appConfig.tableName;
  const command = new GetCommand({
    TableName,
    Key,
    ProjectionExpression: 'sk',
  });
  const data = (await dbClient().send(
    command,
  )) as GetCommandOutput<JobListItem>;

  return !!data.Item;
}

async function queryUnique(
  userId: string,
  jobListId: string,
): Promise<JobList | undefined> {
  const Key: JobListCK = getJobListCK({ userId, jobListId });
  const TableName = appConfig.tableName;
  const command = new GetCommand({ TableName, Key });
  const data = (await dbClient().send(
    command,
  )) as GetCommandOutput<JobListItem>;

  if (!data.Item) return undefined;
  const jobList = removeCK(data.Item);
  return jobList;
}

async function findAll(userId: string): Promise<JobList[]> {
  const jobListCK = getJobListCK({ userId, jobListId: '' });
  const ExpressionAttributeValues = getExpAttrValues(jobListCK);
  const TableName = appConfig.tableName;
  const command = new QueryCommand({
    TableName,
    ScanIndexForward: true,
    KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
    ExpressionAttributeValues,
  });
  const res = (await dbClient().send(
    command,
  )) as QueryCommandOutput<JobListItem>;

  const jobLists = res.Items?.map((jobList) => {
    return removeCK(jobList);
  });
  return jobLists ?? [];
}

export const jobListDB = { createMany, findAll, queryUnique, update, create };
