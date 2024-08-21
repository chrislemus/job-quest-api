import dbClient from './dynamo-db-document-client.service';
import { RequireFields } from '@/common/types';
import { createUserCK, UserCK } from './composite-key.util';
import { UserSchema } from '@/user/schemas';
import { appConfig, notFoundException, uuid } from '@/common';
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

type UserDBEntity = Omit<UserSchema, 'id'> & { userId: string } & UserCK;

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

async function create(user: Omit<UserSchema, 'id' | 'refreshToken'>) {
  const TableName = appConfig.tableName;
  const userId = uuid();
  const userCk = createUserCK({ userId });

  const Item: UserDBEntity = { userId, ...user, ...userCk };

  const command = new PutCommand({ TableName, Item });

  await dbClient().send(command);

  const data = await queryUnique(userId);
  return data;
}

function update(user: RequireFields<Partial<UserSchema>, 'id'>) {
  const TableName = appConfig.tableName;
  const { id, ...data } = user;
  if (!Object.keys(data).length) {
    throw new Error('No data to update');
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

  return dbClient().send(command) as Promise<PutCommandOutput<UserDBEntity>>;
}

async function queryUnique(userId: string): Promise<UserSchema> {
  const TableName = appConfig.tableName;
  const Key = createUserCK({ userId });
  const command = new GetCommand({ TableName, Key });

  const { Item: data } = (await dbClient().send(
    command,
  )) as GetCommandOutput<UserDBEntity>;

  if (!data) throw new Error();
  const user = createUserRes(data);
  return user;
}

async function findByEmail(email: string) {
  const TableName = appConfig.tableName;
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

  const data = (await dbClient().send(
    command,
  )) as ScanCommandOutput<UserDBEntity>;

  const userDB = data.Items?.[0];
  // if (!userDB) throw notFoundException('User not found');
  // const user = createUserRes(userDB);

  return userDB ? createUserRes(userDB) : undefined;
}

async function deleteUser(userId: string) {
  const TableName = appConfig.tableName;
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

  (await dbClient().send(command)) as DeleteCommandOutput<UserDBEntity>;

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

//   return dbClient().send(command) as Promise<
//     QueryCommandOutputType<{
//       id: string;
//       email: string;
//     }>
//   >;
// }
export const userDB = { create, update, queryUnique, findByEmail, deleteUser };
