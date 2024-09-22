const entries = <T1, T extends Record<string, T1>>(obj: T) =>
  Object.entries(obj) as [keyof T, NonNullable<T[keyof T]>][];

const keys = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

/** Wrapper object {@link Object} with defined types */
export const Obj = {
  entries,
  keys,
};
