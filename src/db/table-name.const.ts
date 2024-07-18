export const TableName = getTableName();

function getTableName() {
  const tableName = process.env.TABLE_NAME;
  const notFound = typeof tableName !== 'string' || tableName.length === 0;
  if (notFound) throw new Error('TABLE_NAME is not defined');
  return tableName;
}
