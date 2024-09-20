import { appConfig, notFoundException, uuid } from '@/shared';
import { CreateAJobLogDto } from '@/features/job-log/dto';
import { JobLogEntity } from '@/features/job-log/entities';
import { getJobLogCK, JobLogCK } from './composite-key.util';
import dbClient from './dynamo-db-document-client.service';
import { GetCommandOutput, QueryCommandOutput } from './types';
import { getExpAttrValues, removeCK } from './db-util';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

type JobLogItem = JobLogEntity & JobLogCK;

async function create(
  userId: string,
  jobLogData: CreateAJobLogDto,
): Promise<unknown> {
  const TableName = appConfig.tableName;
  const jobLogId = uuid();
  const jobLogCK = getJobLogCK({ userId, jobLogId });
  const createdAt = Date.now();
  const Item: JobLogItem = {
    id: jobLogId,
    userId,
    createdAt,
    updatedAt: createdAt,
    ...jobLogData,
    ...jobLogCK,
  };
  const ConditionExpression =
    'attribute_not_exists(pk) AND attribute_not_exists(sk)';
  const command = new PutCommand({ TableName, Item, ConditionExpression });
  return dbClient().send(command);
}

async function getUnique(
  userId: string,
  jobLogId: string,
): Promise<JobLogEntity> {
  const Key = getJobLogCK({ userId, jobLogId });
  const TableName = appConfig.tableName;

  const command = new GetCommand({ TableName, Key });
  const data = (await dbClient().send(command)) as GetCommandOutput<JobLogItem>;

  if (!data.Item) throw notFoundException();

  const jobLog = removeCK(data.Item);
  return jobLog;
}

async function findAll(userId: string): Promise<JobLogEntity[]> {
  const jobLogCK = getJobLogCK({ userId, jobLogId: '' });
  const ExpressionAttributeValues = getExpAttrValues(jobLogCK);
  const TableName = appConfig.tableName;

  const command = new QueryCommand({
    TableName,
    ScanIndexForward: true,
    KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
    ExpressionAttributeValues,
  });

  const res = (await dbClient().send(
    command,
  )) as QueryCommandOutput<JobLogItem>;

  const jobLogs = res.Items?.map((jobLog) => removeCK(jobLog));
  return jobLogs ?? [];
}

export const jobLogDB = { create, getUnique, findAll };
