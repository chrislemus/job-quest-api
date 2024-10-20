import {
  DynamoDBClient,
  CreateTableInput,
  DynamoDB,
} from '@aws-sdk/client-dynamodb';
import _tableDefinition from './db-table-definition.json';
export { CreateTableInput };

const dbConfigInternal = {
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
} as const;

const dbClient = new DynamoDBClient(dbConfigInternal);
export const dynamodb = new DynamoDB(dbConfigInternal);

export const dbConfig = {
  client: dbClient,
  table: 'electro',
} as const;

export const tableDefinition = {
  TableName: dbConfig.table,
  ..._tableDefinition,
} as CreateTableInput;
