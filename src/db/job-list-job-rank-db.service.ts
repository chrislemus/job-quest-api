import { Injectable } from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { QueryCommandOutput } from './types';
import { getExpAttrValues, removeCK } from './db-util';
import { getJobListJobRankCK, JobListJobRankCK } from './composite-key.util';
import { TableName } from './table-name.const';
import { JobListRankDto } from 'src/job/dto';
// import { JobListJobRankItem } from './job-list-db.service';

export type JobListJobRank = {
  jobListId: string;
  jobListRank: string;
  jobId: string;
};

export type JobListJobRankItem = JobListJobRank & JobListJobRankCK;

@Injectable()
export class JobListJobRankDBService {
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async hasJobsAssigned(jobListId: string) {
    const ck = getJobListJobRankCK({ jobListId, jobListRank: '' });
    const ExpressionAttributeValues = getExpAttrValues(ck);

    const command = new QueryCommand({
      TableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues,
      Limit: 1,
    });

    const data = (await this.dbClient.send(command)) as QueryCommandOutput<any>;
    return data.Items?.length === 0;
  }

  async findAll(jobListId: string) {
    const ck = getJobListJobRankCK({ jobListId, jobListRank: '' });
    const ExpressionAttributeValues = getExpAttrValues(ck);

    const command = new QueryCommand({
      TableName,
      ScanIndexForward: true,
      KeyConditionExpression: 'pk = :pk And begins_with(sk, :sk)',
      ExpressionAttributeValues,
    });
    const res = (await this.dbClient.send(
      command,
    )) as QueryCommandOutput<JobListJobRankItem>;

    const jobLists = res.Items?.map((item) => {
      return removeCK(item);
    });

    return jobLists ?? [];
  }

  putCmdInput(jobListJobRank: JobListJobRank) {
    const { jobListId, jobListRank } = jobListJobRank;
    const jobListJobRankCK = getJobListJobRankCK({
      jobListId,
      jobListRank,
    });

    return {
      TableName,
      Item: { ...jobListJobRankCK, ...jobListJobRank },
      ConditionExpression:
        'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    } as const;
  }

  updateCmdInput(
    jobListJobRankOld: JobListJobRank,
    jobListJobRankNew: Pick<JobListJobRank, 'jobListId' | 'jobListRank'>,
  ) {
    let updatesExist = false;
    Object.keys(jobListJobRankNew).forEach((key) => {
      if (jobListJobRankOld[key] !== jobListJobRankNew[key]) {
        updatesExist = true;
      }
    });
    if (!updatesExist) {
      throw new Error('No updates to perform');
    }
    const oldJobListJobRankCK = getJobListJobRankCK(jobListJobRankOld);
    const newJobListJobRankCK = getJobListJobRankCK(jobListJobRankNew);

    const jobListJobRankItem = {
      ...newJobListJobRankCK,
      jobId: jobListJobRankOld.jobId,
      jobListIdNew: jobListJobRankNew.jobListId,
      jobListRankNew: jobListJobRankNew.jobListRank,
      jobListIdOld: jobListJobRankOld.jobListId,
      jobListRankOld: jobListJobRankOld.jobListRank,
    };

    const jobListJobRankCKUpdate = {
      TableName,
      Key: oldJobListJobRankCK,
      UpdateExpression:
        'SET pk = :pk , sk = :sk, jobListId = :jobListIdNew, jobListRank = :jobListRankNew',
      ExpressionAttributeValues: getExpAttrValues(jobListJobRankItem),
      ConditionExpression:
        'jobId = :jobId AND jobListId = :jobListIdOld AND jobListRank = :jobListRankOld',
    } as const;
    return jobListJobRankCKUpdate;
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
    )) as QueryCommandOutput<JobListJobRankItem>;

    const ranks = res.Items?.map((item) => item.jobListRank);
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

  deleteCmdInput(
    jobListJobRank: Pick<JobListJobRank, 'jobListId' | 'jobListRank'>,
  ) {
    const { jobListId, jobListRank } = jobListJobRank;
    const jobListJobRankCK = getJobListJobRankCK({
      jobListId,
      jobListRank,
    });

    return {
      TableName,
      Key: jobListJobRankCK,
    } as const;
  }
  // async create(jobJobListRank: JobJobListRank) {
  //   // const Item = {
  //   //   ...job,
  //   //   id: uuidv4() as string,
  //   // };

  //   const command = new PutCommand({
  //     TableName,
  //     Item: jobJobListRank,
  //     ReturnValues: 'ALL_OLD',
  //   });

  //   await this.dbClient.send(command);

  //   const data = await this.queryUnique(jobJobListRank);
  //   return data;
  // }

  // update(jobList: Partial<Pick<Job, 'label'>> & Pick<Job, 'id' | 'userId'>) {
  //   const { id, userId, ...data } = jobList;
  //   if (!Object.keys(data).length) {
  //     throw new BadRequestException('No data to update');
  //   }

  //   // const Item = {
  //   //   id,
  //   //   createdAt: new Date().toISOString(),
  //   //   ...user,
  //   // };
  //   const ExpressionAttributeValues = {};
  //   let UpdateExpression = 'SET';
  //   for (const key in data) {
  //     ExpressionAttributeValues[`:${key}`] = data[key];
  //     UpdateExpression += ` ${key} = :${key},`;
  //   }
  //   if (UpdateExpression.endsWith(',')) {
  //     UpdateExpression = UpdateExpression.slice(0, -1);
  //   }

  //   const command = new UpdateCommand({
  //     TableName,
  //     Key: { id, userId },
  //     UpdateExpression,
  //     ExpressionAttributeValues,
  //     ReturnValues: 'ALL_NEW',
  //   });

  //   return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
  // }

  // async queryUnique(jobJobListRank: JobJobListRank) {
  //   const command = new GetCommand({
  //     TableName,
  //     Key: jobJobListRank,
  //   });

  //   const data = (await this.dbClient.send(
  //     command,
  //   )) as GetCommandOutput<JobJobListRank>;
  //   return data;
  // }

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

  // async totalCount(userId: string) {
  //   const command = new ScanCommand({
  //     TableName,
  //     FilterExpression: 'userId = :userId',
  //     Select: 'COUNT',
  //     ExpressionAttributeValues: { ':userId': userId },
  //   });

  //   const { Count } = (await this.dbClient.send(command)) as ScanCommandOutput<{
  //     Count: number;
  //   }>;

  //   if (!Count) throw new NotFoundException();
  //   return Count;
  // }

  // delete(userId: string, jobListId: string) {
  //   const command = new DeleteCommand({
  //     TableName,
  //     Key: { id: { S: jobListId }, userId: { S: userId } },
  //   });

  //   return this.dbClient.send(command) as Promise<DeleteCommandOutput<Job>>;
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
  //   });

  //   return this.dbClient.send(command) as Promise<
  //     QueryCommandOutput<JobJobListRank>
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
  //   return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  // }
}
