import { BadRequestException, Injectable } from '@nestjs/common';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import { v4 as uuidv4 } from 'uuid';
import { TableName } from './table-name.const';
import { RequireFields } from '@app/common/types';
import { createUserCK, UserCK } from './composite-key.util';
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

// const TableName = 'JobQuest-User';
// console.log(self.crypto.randomUUID);
// console.log(new Date().toISOString());

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUBSCRIBER' | 'ADMIN';
  password: string; // hash later!!!!!!!!!!!
  refreshToken?: string;
};

type UserDBEntity = Omit<User, 'id'> & { userId: string } & UserCK;

function createUserRes<T extends UserDBEntity>(data: T) {
  return {
    id: data.userId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    password: data.password,
    refreshToken: data.refreshToken,
  };
}

// type UserOutput = Omit<User, 'id'> & UserCK;

@Injectable()
export class UserDBService {
  constructor(private dbClient: DynamoDBDocumentClientService) {}

  async create(user: Omit<User, 'id' | 'refreshToken'>) {
    const userId = uuidv4();
    const userCk = createUserCK({ userId });

    const Item: UserDBEntity = { userId, ...user, ...userCk };

    const command = new PutCommand({ TableName, Item });

    await this.dbClient.send(command);

    const data = await this.queryUnique(userId);
    return data;
  }

  update(user: RequireFields<Partial<User>, 'id'>) {
    const { id, ...data } = user;
    if (!Object.keys(data).length) {
      throw new BadRequestException('No data to update');
    }
    const userCK = createUserCK({ userId: id });
    const ExpressionAttributeValues = {};
    let UpdateExpression = 'SET';
    for (const key in data) {
      let value = data[key];
      if (key === 'refreshToken' && value === undefined) {
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
      Key: userCK,
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    return this.dbClient.send(command) as Promise<
      PutCommandOutput<UserDBEntity>
    >;
  }

  async queryUnique(userId: string): Promise<User> {
    const Key = createUserCK({ userId });
    const command = new GetCommand({ TableName, Key });

    const { Item: data } = (await this.dbClient.send(
      command,
    )) as GetCommandOutput<UserDBEntity>;

    if (!data) throw new Error();
    const user = createUserRes(data);
    return user;
  }

  async findByEmail(email: string) {
    const userPartialCK = createUserCK({ userId: '' });
    // improve this query
    // improve this query
    // improve this query
    // improve this query
    // improve this query
    // improve this query
    const command = new ScanCommand({
      TableName,
      FilterExpression: 'sk = :sk AND begins_with(pk, :pk) AND email = :email ',
      ExpressionAttributeValues: {
        ':email': email,
        ':sk': userPartialCK.sk,
        ':pk': userPartialCK.pk,
      },
      ConsistentRead: true,
    });

    const data = (await this.dbClient.send(
      command,
    )) as ScanCommandOutput<UserDBEntity>;

    const userDB = data.Items?.[0];
    // if (!userDB) throw new NotFoundException('User not found');
    // const user = createUserRes(userDB);

    return userDB ? createUserRes(userDB) : null;
  }

  async delete(userId: string) {
    const userCK = createUserCK({ userId });
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    // clean up all user data
    const command = new DeleteCommand({
      TableName,
      Key: userCK,
    });

    (await this.dbClient.send(command)) as DeleteCommandOutput<UserDBEntity>;

    return { id: userId };
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
