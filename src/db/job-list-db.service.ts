import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { TableName } from './table-name.const';
import { ConfigService } from '@nestjs/config';
import { RequireFields } from '@app/common/types';

// const TableName = 'JobQuest-JobList';

// const
export type JobListJobCountPK = `jobList#${string}#jobCount`;
export type JobListJobCountSK = `"count"`;
export type JobListJobCountCK = {
  pk: JobListJobCountPK;
  sk: JobListJobCountSK;
};

export function createJobListJobCountCK(jobListId: string): JobListJobCountCK {
  const pk: JobListJobCountPK = `jobList#${jobListId}#jobCount`;
  const sk: JobListJobCountSK = `"count"`;
  return { pk, sk };
}

export type JobListJobRankPK = `jobList#${string}#jobRank`;
export type JobListJobRankSK = `jobRank#${string}`;
export type JobListJobRankCK = {
  pk: JobListJobRankPK;
  sk: JobListJobRankSK;
};
export type JobListJobRank = {
  jobListId: string;
  jobListRank: string;
  jobId: string;
};

type JobListJobRankOutput = Omit<JobListJobRank, 'jobListId' | 'jobListRank'> &
  JobListJobRankCK;

function jobListJobRankPkIds(pk: JobListJobRankPK) {
  const jobListId = pk.split('#')[1];
  return { jobListId };
}

function jobListJobRankSkIds(sk: JobListJobRankSK) {
  const jobListRank = sk.split('#')[1];
  return { jobListRank };
}

function jobListJobRankCkIds(ck: JobListJobRankCK) {
  const { jobListId } = jobListJobRankPkIds(ck.pk);
  const { jobListRank } = jobListJobRankSkIds(ck.sk);
  return { jobListId, jobListRank };
}

export function createJobListJobRankCK(
  jobListId: string,
  jobRank: string,
): JobListJobRankCK {
  const pk: JobListJobRankPK = `jobList#${jobListId}#jobRank`;
  const sk: JobListJobRankSK = `jobRank#${jobRank}`;
  return { pk, sk };
}

type JobListPK = `user#${string}#jobList`;
type JobListSK = `jobList#${string}`;
type JobListCK = {
  pk: JobListPK;
  sk: JobListSK;
};

type JobList = {
  userId: string;
  id: string;
  order: number;
  label: string;
};

type JobListOutput = Omit<JobList, 'userId' | 'id'> & JobListCK;

function jobListPkIds(pk: JobListPK) {
  const userId = pk.split('#')[1];
  return { userId };
}

function jobListSkIds(sk: JobListSK) {
  const jobListId = sk.split('#')[1];
  return { jobListId };
}

function jobListCkIds(ck: JobListCK) {
  const { userId } = jobListPkIds(ck.pk);
  const { jobListId } = jobListSkIds(ck.sk);
  return { userId, jobListId };
}

export function createJobListCK(userId: string, jobListId: string): JobListCK {
  const pk: JobListPK = `user#${userId}#jobList`;
  const sk: JobListSK = `jobList#${jobListId}`;
  return { pk, sk };
}

function removeKeys<T1 extends Record<any, any>, T2 extends keyof T1>(
  data: T1,
  keys: T2[],
): Omit<T1, T2> {
  const copy = { ...data };
  keys.forEach((key) => delete copy[key]);
  return copy;
}

type JobListCreateInput = Omit<JobList, 'id' | 'order'>;
type JobListCreateItem = Omit<JobList, 'id' | 'userId'> & JobListCK;

@Injectable()
export class JobListDBService {
  constructor(
    private dbClient: DynamoDBDocumentClientService,
    private configService: ConfigService,
  ) {}

  async create(jobList: JobListCreateInput): Promise<JobList> {
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

    const sk = `jobList#${jobListId}` as const;
    const pk = `user#${userId}#jobList` as const;
    const Item: JobListCreateItem = { order, label, pk, sk };

    const JobCountItem = this.jobListJobCountPutInput(jobListId, 0);

    const command = new TransactWriteCommand({
      TransactItems: [
        { Put: { TableName, Item } },
        { Put: { TableName, Item: JobCountItem } },
      ],
    });
    await this.dbClient.send(command);

    return { order, label, id: jobListId, userId };
  }

  jobListJobCountPutInput(jobListId: string, count: number) {
    const pk: JobListJobCountPK = `jobList#${jobListId}#jobCount`;
    const sk: JobListJobCountSK = `"count"`;
    return { count, pk, sk };
  }

  async createMany(
    userId: string,
    jobListItems: Omit<JobListCreateInput, 'userId'>[],
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
      const jobListId = uuidv4();
      const sk = `jobList#${jobListId}` as const;
      const pk = `user#${userId}#jobList` as const;
      const Item: JobListCreateItem = { order, label, pk, sk };

      const JobCountItem = this.jobListJobCountPutInput(jobListId, 0);

      TransactItems.push(
        { Put: { TableName, Item } },
        { Put: { TableName, Item: JobCountItem } },
      );
    });

    const command = new TransactWriteCommand({ TransactItems });
    const res = await this.dbClient.send(command);

    return res;
  }

  async getJobCount(jobListId: string) {
    const pk: JobListJobCountPK = `jobList#${jobListId}#jobCount`;
    const sk: JobListJobCountSK = `"count"`;
    const command = new GetCommand({
      TableName,
      Key: { pk, sk },
      ProjectionExpression: 'count',
    });

    const data = (await this.dbClient.send(command)) as GetCommandOutput<{
      count: number;
    }>;

    const count = data.Item?.count;
    if (count === undefined)
      throw new BadRequestException('Job List count not found');
  }

  async getLastJobListId(userId: string): Promise<number | null> {
    const pk: JobListPK = `user#${userId}#jobList`;
    const sk: JobListSK = 'jobList#';

    const command = new QueryCommand({
      TableName,
      ScanIndexForward: false,
      ConsistentRead: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
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
    const pk: JobListPK = `user#${userId}#jobList`;
    const sk: JobListSK = `jobList#${id}`;

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
      Key: { pk, sk },
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const { Attributes: updatedJobList } = (await this.dbClient.send(
      command,
    )) as PutCommandOutput<JobList>;

    return updatedJobList;
  }

  async jobListExist(userId: string, jobListId: string): Promise<boolean> {
    const pk: JobListPK = `user#${userId}#jobList`;
    const sk: JobListSK = `jobList#${jobListId}`;
    const command = new GetCommand({
      TableName,
      Key: { pk, sk },
      ProjectionExpression: 'sk',
    });
    const data = (await this.dbClient.send(command)) as GetCommandOutput<
      JobListOutput | undefined
    >;

    return !!data.Item;
  }

  async queryUnique(
    userId: string,
    jobListId: string,
  ): Promise<JobList | undefined> {
    const pk: JobListPK = `user#${userId}#jobList`;
    const sk: JobListSK = `jobList#${jobListId}`;
    const command = new GetCommand({
      TableName,
      Key: { pk, sk },
    });
    const data = (await this.dbClient.send(command)) as GetCommandOutput<
      JobListOutput | undefined
    >;

    if (!data.Item) return undefined;
    const jobList = removeKeys(data.Item, ['pk', 'sk']);
    return { userId, id: jobListId, ...jobList };
  }

  // async findByEmail(email: string) {
  //   const command = new ScanCommand({
  //     TableName,
  //     FilterExpression: 'email = :email',
  //     ExpressionAttributeValues: { ':email': email },
  //     Limit: 1,
  //   });

  //   const data = (await this.dbClient.send(command)) as ScanCommandOutput<User>;
  //   const user = data.Items?.[0];
  //   if (!user) throw new NotFoundException('User not found');
  //   return user;
  // }

  // delete(userId: string, jobListId: string) {
  //   const command = new DeleteCommand({
  //     TableName,
  //     Key: { id: { S: jobListId }, userId: { S: userId } },
  //   });

  //   return this.dbClient.send(command) as Promise<DeleteCommandOutput<JobList>>;
  // }

  // query(userId: string, email: string) {
  //   // params;
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   const command = new QueryCommand({
  //     TableName,
  //     ExpressionAttributeValues: { ':id': userId, ':email': email },
  //     KeyConditionExpression: 'id = :id, email = :email',
  //   });

  //   return this.dbClient.send(command) as Promise<
  //     QueryCommandOutputType<{
  //       id: string;
  //       email: string;
  //     }>
  //   >;
  // }

  // query(params: Omit<QueryCommandInput, 'TableName'>) {
  //   // params;
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   // console.log(this.tableName);
  //   const command = new QueryCommand({
  //     TableName,
  //     ...params,
  //     // ExpressionAttributeValues: { ':userId': userId.toString() },
  //     // KeyConditionExpression: 'userId = :userId',
  //   });
  //   return this.dbClient.send(command) as Promise<QueryCommandOutput<JobList>>;
  // }

  async findAll(userId: string): Promise<JobList[]> {
    const jobListCK = createJobListCK(userId, '');
    const command = new QueryCommand({
      TableName,
      ScanIndexForward: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': jobListCK.pk, ':sk': jobListCK.sk },
    });
    const res = (await this.dbClient.send(
      command,
    )) as QueryCommandOutput<JobListOutput>;

    const jobLists = res.Items?.map((jobList) => {
      const { pk, sk, ...jobListRes } = jobList;
      const { jobListId } = jobListCkIds({ pk, sk });
      return { id: jobListId, userId, ...jobListRes } as JobList;
    });

    return jobLists ?? [];
  }
  async findAllJobListJobRanks(jobListId: string): Promise<JobListJobRank[]> {
    const pk: JobListJobRankPK = `jobList#${jobListId}#jobRank`;
    const sk: JobListJobRankSK = `jobRank#$`;
    const command = new QueryCommand({
      TableName,
      ScanIndexForward: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    });
    const res = (await this.dbClient.send(
      command,
    )) as QueryCommandOutput<JobListJobRankOutput>;

    const jobLists = res.Items?.map((item) => {
      const { jobId, ...ck } = item;
      // const { pk, sk, ...data } = item;
      const { jobListRank, jobListId } = jobListJobRankCkIds(ck);
      return { jobId, jobListRank, jobListId };
    });

    return jobLists ?? [];
  }
}
