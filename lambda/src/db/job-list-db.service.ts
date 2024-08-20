import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  GetCommand,
  PutCommand,
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
import { uuid } from '../common';
import { TableName } from './table-name.const';
import { ConfigService } from '@nestjs/config';
import { RequireFields } from 'src/common/types';
import { getExpAttrValues, removeCK } from './db-util';
import { getJobListCK, JobListCK } from './composite-key.util';
import { JobListJobRankDBService } from './job-list-job-rank-db.service';

type JobList = {
  userId: string;
  id: string;
  order: number;
  label: string;
};

type JobListItem = JobList & JobListCK;

@Injectable()
export class JobListDBService {
  constructor(
    private dbClient: DynamoDBDocumentClientService,
    private configService: ConfigService,
    private jobListJobRank: JobListJobRankDBService,
  ) {}

  async create(jobList: Omit<JobList, 'id' | 'order'>): Promise<JobList> {
    const { label, userId } = jobList;
    const jobListId = uuidv4();
    const lastJobListId = await this.getLastJobListId(userId);
    const order = lastJobListId ? lastJobListId + 1 : 1; // must start at index 1

    // hard limit due to storage constraints
    const createLimit =
      this.configService.get<number>('JOB_LIST_CREATE_LIMIT') ?? 0;
    if (order >= createLimit) {
      throw new ConflictException(
        `Exceeded Job List limit (${createLimit}). Consider deleting Job Lists to free up some space.`,
      );
    }
    const ck = getJobListCK({ userId, jobListId });
    const Item: JobListItem = { order, label, userId, id: jobListId, ...ck };
    const command = new PutCommand({ TableName, Item });
    await this.dbClient.send(command);

    return { order, label, id: jobListId, userId };
  }

  async createMany(
    userId: string,
    jobListItems: Omit<JobList, 'userId' | 'id' | 'order'>[],
  ) {
    if (jobListItems.length === 0) throw new BadRequestException('No data');
    const lastJobListId = await this.getLastJobListId(userId);
    const startOrder = lastJobListId ? lastJobListId + 1 : 1; // must start at index 1
    const totalJobListItemsAfterCreate = startOrder + jobListItems.length;

    // hard limit due to storage constraints
    const createLimit =
      this.configService.get<number>('JOB_LIST_CREATE_LIMIT') ?? 0;
    if (totalJobListItemsAfterCreate >= createLimit) {
      throw new ConflictException(
        `Exceeded Job List limit (${createLimit}). Consider deleting Job Lists to free up some space.`,
      );
    }

    const TransactItems: TransactWriteCommandInput['TransactItems'] = [];

    jobListItems.forEach(({ label }, idx) => {
      const order = startOrder + idx;
      const id = uuidv4();
      const ck = getJobListCK({ userId, jobListId: id });
      const Item: JobListItem = { order, label, id, userId, ...ck };
      TransactItems.push({ Put: { TableName, Item } });
    });

    const command = new TransactWriteCommand({ TransactItems });
    const res = await this.dbClient.send(command);

    return res;
  }

  async getLastJobListId(userId: string): Promise<number | null> {
    const ck: JobListCK = getJobListCK({ userId, jobListId: '' });
    const ExpressionAttributeValues = getExpAttrValues(ck);

    const command = new QueryCommand({
      TableName,
      ScanIndexForward: false,
      ConsistentRead: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues,
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'sk',
      Limit: 1,
    });

    const res = (await this.dbClient.send(command)) as QueryCommandOutput<
      Pick<JobListCK, 'sk'>
    >;

    const lastJobListId = res.Items?.[0]?.sk.split('#')[1];
    const lastJobListIdNum = lastJobListId ? parseInt(lastJobListId) : null;
    return lastJobListIdNum ?? null;
  }

  async update(
    jobList: RequireFields<
      Partial<Pick<JobList, 'label' | 'id' | 'userId'>>,
      'id' | 'userId'
    >,
  ) {
    const { id, userId, ...data } = jobList;
    const Key: JobListCK = getJobListCK({ userId, jobListId: id });

    if (!Object.keys(data).length) {
      throw new BadRequestException('No data to update');
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

    const command = new UpdateCommand({
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const { Attributes: updatedJobListRaw } = (await this.dbClient.send(
      command,
    )) as PutCommandOutput<Omit<JobList, 'userId' | 'id'> & JobListCK>;
    if (!updatedJobListRaw) {
      throw new BadRequestException('Job List not found');
    }
    const updatedJobList = removeCK(updatedJobListRaw);

    return { ...updatedJobList, id, userId };
  }

  async jobListExist(userId: string, jobListId: string): Promise<boolean> {
    const Key: JobListCK = getJobListCK({ userId, jobListId });
    const command = new GetCommand({
      TableName,
      Key,
      ProjectionExpression: 'sk',
    });
    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobListItem>;

    return !!data.Item;
  }

  async queryUnique(
    userId: string,
    jobListId: string,
  ): Promise<JobList | undefined> {
    const Key: JobListCK = getJobListCK({ userId, jobListId });

    const command = new GetCommand({ TableName, Key });
    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobListItem>;

    if (!data.Item) return undefined;
    const jobList = removeCK(data.Item);
    return jobList;
  }

  async findAll(userId: string): Promise<JobList[]> {
    const jobListCK = getJobListCK({ userId, jobListId: '' });
    const ExpressionAttributeValues = getExpAttrValues(jobListCK);
    const command = new QueryCommand({
      TableName,
      ScanIndexForward: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues,
    });
    const res = (await this.dbClient.send(
      command,
    )) as QueryCommandOutput<JobListItem>;

    const jobLists = res.Items?.map((jobList) => {
      return removeCK(jobList);
    });
    return jobLists ?? [];
  }
}
