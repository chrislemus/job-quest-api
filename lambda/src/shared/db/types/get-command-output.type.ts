import { GetCommandOutput as _GetCommandOutput } from '@aws-sdk/lib-dynamodb';

export type GetCommandOutput<T> = Omit<_GetCommandOutput, 'Item'> & {
  Item?: T;
};
