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

const TableName = 'JobQuest-Job';

export type Job = {
  userId: string;
  id: string;
  'userId#jobListId': string;
  jobRank: string;
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
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async create(job: Omit<Job, 'id'>) {
    const Item = {
      ...job,
      id: uuidv4() as string,
    };

    const command = new PutCommand({
      TableName,
      Item,
      ReturnValues: 'ALL_OLD',
    });

    await this.dbClient.send(command);

    const data = await this.getUnique(Item.userId, Item.id);
    // data.Item
    return data;
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

    const command = new UpdateCommand({
      TableName,
      Key: { id, userId },
      ExpressionAttributeNames,
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    return this.dbClient.send(command) as Promise<PutCommandOutput<Job>>;
  }

  async getUnique(userId: string, jobId: string) {
    const command = new GetCommand({
      TableName,
      Key: { userId, id: jobId },
    });

    const data = (await this.dbClient.send(command)) as GetCommandOutput<Job>;
    return data;
  }

  async totalCount(userId: string) {
    const command = new ScanCommand({
      TableName,
      FilterExpression: 'userId = :userId',
      Select: 'COUNT',
      ExpressionAttributeValues: { ':userId': userId },
    });

    const res = (await this.dbClient.send(command)) as ScanCommandOutput<{
      Count: number;
    }>;
    if (!res.Count && res.Count !== 0) throw new NotFoundException();
    return res.Count;
  }

  delete(userId: string, jobListId: string) {
    const command = new DeleteCommand({
      TableName,
      Key: { id: jobListId, userId },
    });
    return this.dbClient.send(command) as Promise<DeleteCommandOutput<Job>>;
  }

  query(params: Omit<QueryCommandInput, 'TableName'>) {
    // params;
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    const command = new QueryCommand({
      TableName,
      // ExpressionAttributeValues: { ':id': userId, ':email': email },
      // KeyConditionExpression: 'id = :id, email = :email',
      ...params,
    });

    return this.dbClient.send(command) as Promise<QueryCommandOutput<Job>>;
  }
  async batchGetItem(params: NativeAttributeValue) {
    // params.
    // params;
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    // console.log(this.tableName);
    const command = new BatchGetCommand({
      // TableName,
      RequestItems: {
        [TableName]: {
          ...params,
        },
      },
      // ExpressionAttributeValues: { ':id': userId, ':email': email },
      // KeyConditionExpression: 'id = :id, email = :email',
      // ...params,
    });

    const res = await this.dbClient.send(command);

    if (res.UnprocessedKeys?.[TableName]) {
      throw new InternalServerErrorException('UnprocessedKeys');
    }

    return {
      $metadata: res.$metadata,
      Items: (res.Responses?.[TableName] || []) as Job[],
    };

    // as Promise<BatchGetCommandOutput>;
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
