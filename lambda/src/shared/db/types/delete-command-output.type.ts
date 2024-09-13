import { DeleteCommandOutput as _DeleteCommandOutput } from '@aws-sdk/lib-dynamodb';

export type DeleteCommandOutput<T> = Omit<
  _DeleteCommandOutput,
  'Attributes'
> & {
  Attributes?: T;
};
