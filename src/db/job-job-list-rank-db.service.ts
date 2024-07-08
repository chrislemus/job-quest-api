import {
  BadRequestException,
  Injectable,
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
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const TableName = 'JobQuest-JobJobListRank';

type JobJobListRank = {
  'userId#jobListId': string;
  jobRank: string;
};

@Injectable()
export class JobJobListRankDBService {
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async create(jobJobListRank: JobJobListRank) {
    // const Item = {
    //   ...job,
    //   id: uuidv4() as string,
    // };

    const command = new PutCommand({
      TableName,
      Item: jobJobListRank,
      ReturnValues: 'ALL_OLD',
    });

    await this.dbClient.send(command);

    const data = await this.queryUnique(jobJobListRank);
    return data;
  }

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

  async queryUnique(jobJobListRank: JobJobListRank) {
    const command = new GetCommand({
      TableName,
      Key: jobJobListRank,
    });

    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobJobListRank>;
    return data;
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

  query(params: Omit<QueryCommandInput, 'TableName'>) {
    // params;
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    const command = new QueryCommand({
      TableName,
      ...params,
    });

    return this.dbClient.send(command) as Promise<
      QueryCommandOutput<JobJobListRank>
    >;
  }

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
