export const TableName = getTableName();

function getTableName() {
  // const tableName = process.env.TABLE_NAME;
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  console.log('pull value from env');
  const tableName = 'JobQuest-dev';
  const notFound = typeof tableName !== 'string' || tableName.length === 0;
  if (notFound) throw new Error('TABLE_NAME is not defined');
  return tableName;
}
