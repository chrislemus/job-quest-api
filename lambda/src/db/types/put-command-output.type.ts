import { PutCommandOutput as _PutCommandOutput } from '@aws-sdk/lib-dynamodb';

export type PutCommandOutput<T> = Omit<_PutCommandOutput, 'Attributes'> & {
  Attributes?: T;
};
