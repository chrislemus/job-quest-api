/* eslint-disable @typescript-eslint/no-var-requires */
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const _client = new DynamoDBClient({ endpoint: 'http://localhost:8000' });
export const client = DynamoDBDocumentClient.from(_client);
globalThis.client = client;

export const TableName = 'JobQuest-dev';
globalThis.TableName = TableName;

module.exports = async function () {
  try {
    console.log('************ createTable: start - TableName:', TableName);
    const createTableCmd = new CreateTableCommand({
      TableName,
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      OnDemandThroughput: { MaxReadRequestUnits: 2, MaxWriteRequestUnits: 2 },
    });

    await client.send(createTableCmd);

    console.log('************ createTable: success');
  } catch (e) {
    const tableExists = e.message === 'Cannot create preexisting table';
    if (tableExists) {
      console.log('************ createTable: canceled - table exist');
      return;
    }
    console.log(e);
    throw e;
  }
};
