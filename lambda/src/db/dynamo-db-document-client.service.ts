import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export class DynamoDBDocumentClientService extends DynamoDBDocumentClient {
  constructor() {
    const client = new DynamoDBClient({
      endpoint: 'http://host.docker.internal:8000',
    });
    super(client);
  }
}
