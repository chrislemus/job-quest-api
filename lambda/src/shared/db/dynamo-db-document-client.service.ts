import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { appConfig } from '../app.config';

class DynamoDBDocumentClientService extends DynamoDBDocumentClient {
  constructor() {
    const client = new DynamoDBClient({
      endpoint: appConfig.DbUrl,
    });
    super(client);
  }
}

let dbClientInstance: DynamoDBDocumentClientService;
export default function dbClient() {
  console.log('------ DB CLIENT');
  if (!dbClientInstance) {
    console.log('CREATING DB INSTANCE');
    dbClientInstance = new DynamoDBDocumentClientService();
  }
  return dbClientInstance;
}
