import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import {
  DeleteCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  ScanCommandOutput,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const TableName = 'JobQuest-User';
// console.log(self.crypto.randomUUID);
// console.log(new Date().toISOString());

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  createdAt: Date;
  role: 'SUBSCRIBER' | 'ADMIN';
  password: string; // hash later!!!!!!!!!!!
  refreshToken: string | null;
};

@Injectable()
export class UserDBService {
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async create(user: Omit<User, 'id' | 'refreshToken' | 'createdAt'>) {
    const Item = {
      ...user,
      id: uuidv4() as string,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName,
      Item,
      ReturnValues: 'ALL_OLD',
    });

    await this.dbClient.send(command);

    const data = await this.queryUnique(Item.id);
    return data;
  }

  update(user: Partial<Omit<User, 'id'>> & Pick<User, 'id'>) {
    const { id, email, ...data } = user;
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
      let value = data[key];
      if (key === 'refreshToken' && value === null) {
        value = '';
      }
      ExpressionAttributeValues[`:${key}`] = value;
      UpdateExpression += ` ${key} = :${key},`;
    }
    if (UpdateExpression.endsWith(',')) {
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    const command = new UpdateCommand({
      TableName,
      Key: { id, email },
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    return this.dbClient.send(command) as Promise<PutCommandOutput<User>>;
  }

  async queryUnique(userId: string) {
    const command = new GetCommand({
      TableName,
      Key: { id: userId },
    });

    const data = (await this.dbClient.send(command)) as GetCommandOutput<User>;
    return data;
  }

  async findByEmail(email: string) {
    const command = new ScanCommand({
      TableName,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
      Limit: 1,
    });

    const data = (await this.dbClient.send(command)) as ScanCommandOutput<User>;
    const user = data.Items?.[0];
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  delete(userId: string) {
    const command = new DeleteCommand({
      TableName,
      Key: { id: { S: userId } },
    });

    return this.dbClient.send(command) as Promise<DeleteCommandOutput<User>>;
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
}
