import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

class DynamoDBDocumentClientService extends DynamoDBDocumentClient {
  constructor() {
    const client = new DynamoDBClient({
      endpoint: 'http://host.docker.internal:8000',
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
