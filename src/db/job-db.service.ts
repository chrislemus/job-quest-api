import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { RequireFields } from '@app/common/types';
import { JobListRankDto } from '@app/job/dto';
import { TableName } from './table-name.const';
import { JobListDBService, JobListJobRankItem } from './job-list-db.service';
import { ConfigService } from '@nestjs/config';
import { getExpAttrValues, removeKeys } from './db-util';
import {
  getJobCK,
  getJobCountCK,
  JobCK,
  getJobListCK,
  getJobListJobRankCK,
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

@Injectable()
export class JobDBService {
  constructor(
    private dbClient: DynamoDBDocumentClientService,
    private jobListDB: JobListDBService,
    private configService: ConfigService,
  ) {}

  async totalJobCount(userId: string, allowCreate = true) {
    const Key = getJobCountCK({ userId });
    const AttributesToGet = ['count'];
    const command = new GetCommand({ TableName, Key, AttributesToGet });

    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobCount>;

    if (!data.Item) {
      const errMsg = 'Failed to get job count';
      if (!allowCreate) throw new NotFoundException(errMsg);

      await this.createJobCount(userId);
      return this.totalJobCount(userId, false);
    }
    return data.Item.count;
  }

  createJobCount(userId: string) {
    const jobCountCK = getJobCountCK({ userId });
    const Item = { ...jobCountCK, count: 0 };
    const ConditionExpression =
      'attribute_not_exists(pk) AND attribute_not_exists(sk)';
    const command = new PutCommand({ TableName, Item, ConditionExpression });
    return this.dbClient.send(command);
  }

  async create(job: Omit<Job, 'id'>) {
    const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');
    if (!createLimit) throw new InternalServerErrorException('No createLimit');
    const JobCount = await this.totalJobCount(job.userId);
    if (JobCount >= createLimit) {
      throw new ConflictException(
        `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
      );
    }

    const { jobListId, jobListRank, userId } = job;
    const jobId = uuidv4();
    const jobCK = getJobCK({ userId, jobId });
    const jobItem: JobItem = { id: jobId, ...job, ...jobCK };

    const jobListJobRankCK = getJobListJobRankCK({ jobListId, jobListRank });
    const jobListJobRankItem: JobListJobRankItem = {
      ...jobListJobRankCK,
      jobId,
      jobListId,
      jobListRank,
    };

    const jobListCK = getJobListCK({ userId, jobListId });

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Update: this.updateCountCmdInput(userId, 'increment'),
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
          Put: {
            TableName,
            Item: jobListJobRankItem,
            ConditionExpression:
              'attribute_not_exists(pk) AND attribute_not_exists(sk)',
          },
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

    await this.dbClient.send(command);
    return removeKeys(jobItem, ['sk', 'pk']);
  }

  updateCountCmdInput(userId: string, action: 'increment' | 'decrement') {
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

  async delete(userId: string, jobId: string) {
    const jobCK = getJobCK({ userId, jobId });

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

    const deleteJobRankCK = getJobListJobRankCK({ jobListId, jobListRank });

    const command = new TransactWriteCommand({
      TransactItems: [
        { Update: this.updateCountCmdInput(userId, 'decrement') },
        { Delete: { TableName, Key: jobCK } },
        { Delete: { TableName, Key: deleteJobRankCK } },
      ],
    });

    await this.dbClient.send(command);
    return this.dbClient.send(command) as Promise<DeleteCommandOutput<Job>>;
  }

  async update(job: RequireFields<Partial<Job>, 'id' | 'userId'>) {
    const { id, userId, ...data } = job;
    if (!Object.keys(data).length) {
      throw new BadRequestException('No data to update');
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
    const jobUpdateCommandInput: TxItem['Update'] = {
      TableName,
      Key: { id, userId },
      ExpressionAttributeNames,
      UpdateExpression,
      ExpressionAttributeValues,
    };

    if (data.jobListId || data.jobListRank) {
      const TransactItems: TransactWriteCommandInput['TransactItems'] = [
        { Update: jobUpdateCommandInput },
      ];

      const res = await this.getUnique(userId, id, [
        'jobListId',
        'jobListRank',
      ]);

      if (data.jobListRank && data.jobListId) {
        const jobListRankMismatch = res.jobListRank !== data.jobListRank;
        const jobListIdMismatch = res.jobListId !== data.jobListId;
        if (jobListRankMismatch || jobListIdMismatch) {
          // const { jobListId, jobListRank } = data;

          const oldJobListJobRankCK = getJobListJobRankCK(res);

          const newJobListJobRankCK = getJobListJobRankCK({
            jobListId: data.jobListId,
            jobListRank: data.jobListRank,
          });
          const jobListJobRankItem: JobListJobRankItem = {
            ...newJobListJobRankCK,
            jobId: id,
            jobListId: data.jobListId,
            jobListRank: data.jobListRank,
          };

          const jobListJobRankCKUpdate: TxItem['Update'] = {
            TableName,
            Key: oldJobListJobRankCK,
            UpdateExpression:
              'SET pk = :pk , sk = :sk, jobId = :jobId, jobListId = :jobListId, jobListRank = :jobListRank',
            ExpressionAttributeValues: getExpAttrValues(jobListJobRankItem),
          };

          TransactItems.push({ Update: jobListJobRankCKUpdate });
        }
      }

      const command = new TransactWriteCommand({ TransactItems });
      return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
    }

    const command = new UpdateCommand(jobUpdateCommandInput);
    return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
  }

  async getUnique<
    JobT extends Job,
    AttrToGetT extends keyof JobT | undefined,
    // ResT extends AttrToGetT extends undefined ? Job : Pick<Job, AttrToGetT>,
    ResT extends AttrToGetT extends undefined
      ? Job
      : {
          [P in keyof JobT]: P extends AttrToGetT ? JobT[P] : never;
        },
  >(
    userId: string,
    jobId: string,
    AttributesToGet?: AttrToGetT[],
  ): Promise<ResT> {
    const command = new GetCommand({
      TableName,
      Key: { userId, id: jobId },
      AttributesToGet: AttributesToGet as string[],
    });

    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobItem>;

    if (!data.Item) throw new NotFoundException();

    const jobRaw = removeKeys(data.Item, ['pk', 'sk']);
    Object.assign(jobRaw, { userId, id: jobId });
    if (!AttributesToGet) return jobRaw as ResT;
    const job = {} as ResT;

    AttributesToGet.forEach((key) => {
      job[key as any] = jobRaw[key as any];
    });
    return job;
  }

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
      : ('begins_with(sk, :sk)' as const);

    const jobListRankCK = getJobListJobRankCK({
      jobListId,
      jobListRank: jobListRank?.rank || '',
    });

    return {
      TableName,
      Limit: 2,
      KeyConditionExpression: `pk = :pk And ${skCondition}`,
      ExpressionAttributeValues: getExpAttrValues(jobListRankCK),
    } as QueryCommandInput;
  }

  async findAll(userId: string) {
    const jobCK = getJobCK({ userId, jobId: '' });

    const command = new QueryCommand({
      TableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: getExpAttrValues(jobCK),
    });
    return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  }

  async findAllByJobListId(userId: string, jobListId: string) {
    const jobListJobRanks = await this.jobListDB.findAllJobListJobRanks(
      jobListId,
    );

    const ExpressionAttributeValues = {};
    const KeyConditionExpressionList: string[] = [];
    jobListJobRanks.forEach((jobRank, idx) => {
      const jobCk = getJobCK({ userId, jobId: jobRank.jobId });
      ExpressionAttributeValues[`:pk${idx}`] = jobCk.pk;
      ExpressionAttributeValues[`:sk${idx}`] = jobCk.sk;
      KeyConditionExpressionList.push(`(pk = :pk${idx} AND sk = :sk${idx})`);
    });

    const command = new QueryCommand({
      TableName,
      KeyConditionExpression: KeyConditionExpressionList.join(' OR '),
      ExpressionAttributeValues,
    });
    return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  }
}
