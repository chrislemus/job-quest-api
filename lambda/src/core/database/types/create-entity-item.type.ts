import { Prettify } from '@/shared/types';
import { CreateEntityItem, Entity } from 'electrodb';

export type TCreateEntityItem<E extends Entity<any, any, any, any>> = Prettify<
  Omit<CreateEntityItem<E>, '_itemIdProp' | 'id'>
>;
// export type TCreateEntityItem<
//   E extends Entity<any, any, any, any>,
//   OmitEntityItem extends never | keyof TEntityItem = never,
//   TEntityItem = CreateEntityItem<E>
// > = Prettify<Omit<TEntityItem, OmitEntityItem>>;

// export type TCreateEntityItem<E extends Entity<any, any, any, any>> = Prettify<
//   Omit<CreateEntityItem<E>, 'id'>
// >;
