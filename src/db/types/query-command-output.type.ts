import { QueryCommandOutput as _QueryCommandOutput } from '@aws-sdk/lib-dynamodb';

export type QueryCommandOutput<T> = Omit<_QueryCommandOutput, 'Items'> & {
  Items?: T[];
};
