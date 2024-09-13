/** get expression attribute values */
export function getExpAttrValues<
  PropT extends string,
  KeyT,
  DataT extends Record<PropT, KeyT>,
>(data: DataT) {
  const newObJ = {} as {
    [Property in keyof DataT as `:${string & Property}`]: DataT[Property];
  };
  Object.entries(data).forEach(([key, value]) => {
    newObJ[`:${key}`] = value;
  });
  return newObJ;
}

export function removeKeys<T1 extends Record<any, any>, T2 extends keyof T1>(
  data: T1,
  keys: T2[],
): Omit<T1, T2> {
  const copy = { ...data };
  keys.forEach((key) => delete copy[key]);
  return copy;
}

/** remove composite keys */
export function removeCK<T1 extends { pk: string; sk: string }>(
  _data: T1,
): Omit<T1, 'pk' | 'sk'> {
  const { pk, sk, ...data } = _data;
  return data;
}

// /** get expression attribute names */
// export function getExpAttrNames<
//   PropT extends string,
//   KeyT,
//   DataT extends Record<PropT, KeyT>,
//   ReturnT = {
//     [Property in keyof DataT as `#${string & Property}`]: Property;
//   },
// >(data: DataT): ReturnT {
//   const newObJ = {} as ReturnT;
//   Object.keys(data).forEach((key) => {
//     newObJ[`#${key}`] = key;
//   });
//   return newObJ;
// }

// /** get expression attribute names/values */
// export function getExpAttrNV<
//   PropT extends string,
//   KeyT,
//   DataT extends Record<PropT, KeyT>,
//   ReturnT = {
//     [Property in keyof DataT as `#${string & Property}`]: Property;
//   },
// >(data: DataT): ReturnT {
//   const newObJ = {} as ReturnT;
//   Object.keys(data).forEach((key) => {
//     newObJ[`#${key}`] = key;
//   });
//   return newObJ;
// }
