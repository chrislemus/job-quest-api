import { BadRequestException, Injectable } from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const TableName = 'JobQuest-JobList';

type JobList = {
  userId: string;
  id: string;
  order: number;
  label: string;
};

@Injectable()
export class JobListDBService {
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async create(jobList: Omit<JobList, 'id'>) {
    const Item = {
      ...jobList,
      id: uuidv4() as string,
    };

    const command = new PutCommand({
      TableName,
      Item,
      ReturnValues: 'ALL_OLD',
    });

    await this.dbClient.send(command);

    const data = await this.queryUnique(Item.userId, Item.id);
    // data.Item
    return data;
  }

  update(
    jobList: Partial<Pick<JobList, 'label'>> & Pick<JobList, 'id' | 'userId'>,
  ) {
    const { id, userId, ...data } = jobList;
    if (!Object.keys(data).length) {
      throw new BadRequestException('No data to update');
    }

    // const Item = {
    //   id,
    //   createdAt: new Date().toISOString(),
    //   ...user,
    // };
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
      Key: { id, userId },
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    return this.dbClient.send(command) as Promise<PutCommandOutput<JobList>>;
  }

  async queryUnique(userId: string, jobListId: string) {
    const command = new GetCommand({
      TableName,
      Key: { id: jobListId, userId },
    });

    const data = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<JobList>;
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

  delete(userId: string, jobListId: string) {
    const command = new DeleteCommand({
      TableName,
      Key: { id: { S: jobListId }, userId: { S: userId } },
    });

    return this.dbClient.send(command) as Promise<DeleteCommandOutput<JobList>>;
  }

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
      // ExpressionAttributeValues: { ':userId': userId.toString() },
      // KeyConditionExpression: 'userId = :userId',
    });
    return this.dbClient.send(command) as Promise<QueryCommandOutput<JobList>>;
  }
}
