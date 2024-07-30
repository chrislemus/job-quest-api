/* eslint-disable @typescript-eslint/no-var-requires */
import {
  DynamoDBClient,
  CreateTableCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

const _client = new DynamoDBClient({ endpoint: 'http://localhost:8000' });
export const client = DynamoDBDocumentClient.from(_client);
globalThis.client = client;

export const TableName = 'JobQuest-dev';
globalThis.TableName = TableName;

module.exports = async function () {
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  // todo: remove this
  await deleteTableItems();
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
async function deleteTableItems() {
  console.log('************ deleteTableItems');
  // console.log('  globalThis.client', globalThis.client);

  type Item = { pk: string; sk: string };
  const itemsToDelete = await getAllItems();
  const itemSets: Item[][] = [];

  let currentByteSize = 0;
  const maxByteSize = 1000000 * 16; // 16 MB max size;
  const maxItems = 25;

  let itemList: Item[] = [];

  const itemsToDeleteCount = itemsToDelete.length;
  itemsToDelete.forEach((item, idx) => {
    const isLastItem = idx === itemsToDeleteCount - 1;
    const objString = JSON.stringify(item);
    const buffer = Buffer.from(objString);
    const byteSize = buffer.byteLength;
    currentByteSize += byteSize;

    if (currentByteSize > maxByteSize || itemList.length >= maxItems) {
      itemSets.push(itemList);
      itemList = [];
    }
    itemList.push(item);
    if (isLastItem) {
      itemSets.push(itemList);
      itemList = [];
    }
  });

  try {
    await Promise.all(
      itemSets.map(async (items) => {
        const deleteItems = items.map((item) => {
          return {
            DeleteRequest: { Key: item },
          };
        });
        const deleteTableItemsCmd = new BatchWriteCommand({
          RequestItems: { [`${TableName}`]: deleteItems },
        });
        await client.send(deleteTableItemsCmd).catch((e) => {
          console.log(e);
          throw e;
        });
      }),
    );
  } catch (error) {
    console.log(error);
    throw new Error('failed to delete ALL dynamodb Table items');
  }

  const itemsToDeleteAfter = await getAllItems();
  if (itemsToDeleteAfter.length > 0) {
    throw new Error('failed to delete all dynamodb Table items');
  }
}

async function getAllItems() {
  let LastEvaluatedKey: Record<string, any> | undefined;
  const items: { pk: string; sk: string }[] = [];
  let loopCount = 0;
  const maxLoopCount = 100;
  do {
    const getAllItemsCmd = new ScanCommand({
      TableName,
      ProjectionExpression: 'pk, sk',
      ExclusiveStartKey: LastEvaluatedKey,
    });
    const res = await client.send(getAllItemsCmd);
    res.Items?.forEach((item) => {
      items.push({ pk: item.pk.S as string, sk: item.sk.S as string });
    });

    LastEvaluatedKey = res.LastEvaluatedKey;
    loopCount++;
  } while (!!LastEvaluatedKey && loopCount < maxLoopCount);

  if (loopCount >= maxLoopCount) {
    throw new Error('deleteAllItems loopCount >= maxLoopCount');
  }

  console.log('************ getAllItems: items.length', items.length);
  return items;
}
