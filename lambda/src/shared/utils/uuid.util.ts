import { randomUUID } from 'crypto';

export const uuid = () => randomUUID({ disableEntropyCache: true });
