import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand,
  NativeAttributeValue,
  ExecuteTransactionCommand,
  TransactWriteCommand,
  UpdateCommandInput,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { RequireFields } from '@app/common/types';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { JobListDto, JobListRankDto } from '@app/job/dto';
import { TableName } from './table-name.const';
import {
  createJobListJobCountCK,
  createJobListJobRankCK,
} from './job-list-db.service';
import { ConfigService } from '@nestjs/config';

// const TableName = 'JobQuest-Job';

type JobPK = `user#${string}#job`;
type JobSK = `job#${string}`;
type JobCK = {
  pk: JobPK;
  sk: JobSK;
};

type JobOutput = Omit<Job, 'userId' | 'id'> & JobCK;

function jobPkIds<T extends JobPK>(pk: T) {
  const userId = pk.split('#')[1];
  return { userId };
}

function jobSkIds<T extends JobSK>(sk: T) {
  const jobId = sk.split('#')[1];
  return { jobId };
}

function jobCkIds<T extends JobCK>(ck: T) {
  const { userId } = jobPkIds(ck.pk);
  const { jobId } = jobSkIds(ck.sk);
  return { userId, jobId };
}

function createJobCK(data: { userId: string; jobId: string }): JobCK {
  const { userId, jobId } = data;
  const pk: JobPK = `user#${userId}#job`;
  const sk: JobSK = `job#${jobId}`;
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

type JobCreateInput = Omit<Job, 'id'>;
type JobItem = Omit<Job, 'id' | 'userId'> & JobCK;

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

@Injectable()
export class JobDBService {
  constructor(
    private dbClient: DynamoDBDocumentClientService,
    private configService: ConfigService,
  ) {}

  async create(job: JobCreateInput) {
    const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');

    const { jobListId, jobListRank, userId } = job;
    const jobId = uuidv4();
    const jobCK = createJobCK({ userId, jobId });
    const jobItem: JobItem = { ...job, ...jobCK };

    const jobListJobCountCK = createJobListJobCountCK(jobListId);
    const jobListJobRankCK = createJobListJobRankCK(jobListId, jobListRank);

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName,
            Key: jobListJobCountCK,
            UpdateExpression: `SET count = count + ${1}`,
            ConditionExpression: `attribute_exists(pk) AND count < ${createLimit}`,
          },
        },
        {
          Put: {
            TableName,
            Item: jobItem,
            // ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
        {
          Put: {
            TableName,
            Item: jobListJobRankCK,
            // ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
      ],
    });

    await this.dbClient.send(command);

    const data = await this.getUnique(userId, jobId);
    // data.Item
    return data;
  }

  async delete(userId: string, jobId: string) {
    // const command = new DeleteCommand({
    //   TableName,
    //   Key: { id: jobId, userId },
    // });
    const jobCK = createJobCK({ userId, jobId });

    const getCmd = new GetCommand({
      TableName,
      Key: jobCK,
      AttributesToGet: ['jobListId', 'jobListRank'],
    });
    const data = (await this.dbClient.send(
      getCmd,
    )) as GetCommandOutput<JobItem>;
    const { jobListId, jobListRank } = data.Item || {};
    if (!jobListId || !jobListRank) throw new NotFoundException();

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName,
            Key: createJobListJobCountCK(jobListId),
            UpdateExpression: `SET count = count - ${1}`,
            ConditionExpression: 'attribute_exists(pk)',
          },
        },
        {
          Delete: {
            TableName,
            Key: jobCK,
          },
        },
        {
          Delete: {
            TableName,
            Key: createJobListJobRankCK(jobListId, jobListRank),
          },
        },
      ],
    });

    await this.dbClient.send(command);
    return this.dbClient.send(command) as Promise<DeleteCommandOutput<Job>>;
  }

  update(job: RequireFields<Partial<Job>, 'id' | 'userId'>) {
    const { id, userId, ...data } = job;
    if (!Object.keys(data).length) {
      throw new BadRequestException('No data to update');
    }

    // const Item = {
    //   id,
    //   createdAt: new Date().toISOString(),
    //   ...user,
    // };
    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};
    let UpdateExpression = 'SET';
    Object.keys(data).forEach((key, idx) => {
      ExpressionAttributeNames[`#k${idx}`] = key;
      ExpressionAttributeValues[`:v${idx}`] = data[key];
      UpdateExpression += ` #k${idx} = :v${idx},`;
    });

    // for (const key in data) {
    //   ExpressionAttributeValues[`:${key}`] = data[key];
    //   UpdateExpression += ` ${key} = :${key},`;
    // }
    if (UpdateExpression.endsWith(',')) {
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    type TxItems = NonNullable<TransactWriteCommandInput['TransactItems']>;
    type TxItem = TxItems[number];
    const jobUpdateCommandInput: TxItem['Update'] = {
      TableName,
      Key: { id, userId },
      ExpressionAttributeNames,
      UpdateExpression,
      ExpressionAttributeValues,
    };

    if (data.jobListId || data.jobListRank) {
      const { jobListId, jobListRank } = data;
      const jobListJobRankCK = createJobListJobRankCK(jobListId, jobListRank);
      const jobListJobRankCKUpdate: UpdateCommandInput = {
        TableName,
        Key: jobListJobRankCK,
        UpdateExpression: 'SET sk = :jobListRank',
        ExpressionAttributeValues: { ':jobListRank': `jobRank${jobListRank}` },
      };

      const TransactItems: TransactWriteCommandInput['TransactItems'] = [
        {
          Update: jobUpdateCommandInput,
        },
      ];

      const command = new TransactWriteCommand({
        TransactItems: [
          {
            Update: jobUpdateCommandInput,
          },
          {
            Update: jobListJobRankCKUpdate,
          },
          {
            ConditionCheck: {
              TableName,
              Key: createJobListJobCountCK(jobListId),
              ConditionExpression: 'attribute_exists(pk)',
            },
          },
        ],
      });

      return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
    }

    const command = new UpdateCommand(jobUpdateCommandInput);
    return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
  }

  async getUnique(
    userId: string,
    jobId: string,
    AttributesToGet?: (keyof Job)[],
  ): Promise<Job> {
    const command = new GetCommand({
      TableName,
      Key: { userId, id: jobId },
      AttributesToGet,
    });

    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobItem>;

    if (!data.Item) throw new NotFoundException();

    const jobRaw = removeKeys(data.Item, ['pk', 'sk']);
    return { userId, id: jobId, ...jobRaw };
  }

  // async totalCount(jobListId: string) {
  //   const command = new GetCommand({
  //     TableName,
  //     Key: { pk: `jobList#${jobListId}#jobCount`, sk: 'count' },
  //     ProjectionExpression: 'count',
  //   });

  //   const res = (await this.dbClient.send(command)) as GetCommandOutput<{
  //     count: number;
  //   }>;
  //   res.Item?.count;
  //   if (!res.count && res.count !== 0) throw new NotFoundException();
  //   return res.Count;
  // }

  async getTopAndBottomJobListRanks(
    jobListId: string,
    jobListRank?: JobListRankDto,
  ) {
    const queryInput = this.getTopAndBottomJobListRanksQueryInput(
      jobListId,
      jobListRank,
    );

    const res = (await this.dbClient.send(
      new QueryCommand(queryInput),
    )) as QueryCommandOutput<JobCK>;

    const ranks = res.Items?.map((item) => item.sk.split('#')[1]);
    return { topRank: ranks?.[1], bottomRank: ranks?.[0] };
  }

  getTopAndBottomJobListRanksQueryInput(
    jobListId: string,
    jobListRank?: JobListRankDto,
  ) {
    let dir = '<=';
    if (jobListRank?.placement === 'bottom') dir = '>=';

    const skCondition = jobListRank
      ? (`sk ${dir} :sk` as const)
      : ('begins_with(sk, jobRank#)' as const);

    return {
      TableName,
      Limit: 2,
      KeyConditionExpression: `pk = :pk And ${skCondition}`,
      ExpressionAttributeValues: {
        ':pk': `jobList#${jobListId}#jobRank`,
        ':sk': `jobRank#${jobListRank?.rank}`,
      },
    } as QueryCommandInput;
  }

  // query(params: Omit<QueryCommandInput, 'TableName'>) {
  //   const command = new QueryCommand({
  //     TableName,
  //     ...params,
  //   });

  //   return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  // }
  // async batchGetItem(params: NativeAttributeValue) {
  //   const command = new BatchGetCommand({
  //     RequestItems: {
  //       [TableName]: {
  //         ...params,
  //       },
  //     },
  //   });

  //   const res = await this.dbClient.send(command);

  //   if (res.UnprocessedKeys?.[TableName]) {
  //     throw new InternalServerErrorException('UnprocessedKeys');
  //   }

  //   return {
  //     $metadata: res.$metadata,
  //     Items: (res.Responses?.[TableName] || []) as Job[],
  //   };

  //   // as Promise<BatchGetCommandOutput>;
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
  //   return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  // }

  // getLastJobListRank(userId: string, jobListId: string) {
  //   const command = new QueryCommand({
  //     TableName,
  //     KeyConditionExpression:
  //       'pk = :pk AND begins_with(jobListRank, :jobListRank)',
  //     ExpressionAttributeValues: {
  //       ':pk': `user#${userId}#jobList#${jobListId}`,
  //       ':jobListRank': 'job#',
  //     },
  //     ScanIndexForward: false,
  //     Limit: 1,
  //   });

  //   return this.dbClient.send(command) as Promise<QueryCommandOutput<JobCK>>;
  // }
}
