import { CreateTableInput, DynamoDB } from '@aws-sdk/client-dynamodb';
export { CreateTableInput };

type InitializeTableOptions = {
  dynamodb: DynamoDB;
  dropOnExists: boolean;
  definition: CreateTableInput;
};

export async function initializeTable(options: InitializeTableOptions) {
  const { definition, dynamodb, dropOnExists } = options;
  const tableManager = createTableManager({ definition, dynamodb });
  const exists = await tableManager.exists();
  if (exists) {
    if (!dropOnExists) {
      return;
    }
    await tableManager.drop();
  }

  await tableManager.create();
}

type CreateTableManagerOptions = {
  dynamodb: DynamoDB;
  definition: CreateTableInput;
};

function createTableManager(options: CreateTableManagerOptions) {
  const { dynamodb, definition } = options;
  const { TableName } = definition;
  if (!TableName) throw new Error('TableName is required');
  return {
    async exists() {
      let tables = await dynamodb.listTables();
      return !!tables.TableNames?.includes(TableName);
    },
    async drop() {
      return dynamodb.deleteTable({ TableName });
    },
    async create() {
      return dynamodb.createTable(definition);
    },
  };
}
