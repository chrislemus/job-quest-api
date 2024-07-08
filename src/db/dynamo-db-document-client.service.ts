import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDBDocumentClientService extends DynamoDBDocumentClient {
  constructor() {
    const client = new DynamoDBClient();
    super(client);
  }
}
