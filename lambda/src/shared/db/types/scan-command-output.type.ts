import { ScanCommandOutput as _ScanCommandOutput } from '@aws-sdk/lib-dynamodb';

export type ScanCommandOutput<T> = Omit<_ScanCommandOutput, 'Items'> & {
  Items?: T[];
};
