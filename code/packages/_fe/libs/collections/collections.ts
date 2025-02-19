import type { 
  __NID, _Fe_AnyI, FeStringKeyedCollectionObject, FeTKeyof,
} from '../core-types/root.types.js';
import {
  _feIsNumber, _feIsIterable,
} from '../probes/probes.js';


// export declare const $fe: unique symbol;
export const $fe = Symbol.for('@feProps');

export type FeMapLikeCollectionObject <
  T extends _Fe_AnyI,
  KeyPropType extends FeTKeyof = string, // @TODO
> =
  FeStringKeyedCollectionObject<T, KeyPropType> & {
  [$fe]?: {
    has?: Map<KeyPropType, T>['has'],
    get?: Map<KeyPropType, T>['get'],
    forEach?: (cb: (
      pyl: T | null,
      key?: KeyPropType,
      self?: FeMapLikeCollectionObject<T, KeyPropType>
    ) => void) => void,
    set?: (
      key: KeyPropType,
      pyl: T,
    ) => FeMapLikeCollectionObject<T, KeyPropType>,
    delete?: Map<KeyPropType, T>['delete'],
    clear?: Map<KeyPropType, T>['clear'],
  }
} & Iterable<T>
  ;

type TFeAnyCollection <
  T extends _Fe_AnyI = _Fe_AnyI
> = Array<T> | Map<__NID, T> | WeakMap<_Fe_AnyI, T> | FeStringKeyedCollectionObject<T>;


export const feAssertStringKeyedCollectionObject = <  // @TODO do really assert
  T extends _Fe_AnyI,
  StringKeyPropName extends FeTKeyof = string,  // @TODO
>(
  collection: T | unknown,
  keyPropName: StringKeyPropName | undefined // @TODO string and symbol or Keyof
): FeStringKeyedCollectionObject<T, StringKeyPropName> | undefined => {
  if (!!collection && collection instanceof Object && typeof keyPropName === 'string' && keyPropName in collection) { // @TODO symbol or number
    return collection as FeStringKeyedCollectionObject<T, StringKeyPropName>;
  }
  return undefined;
};
// @TODO check if the prop is the one holding the T type (FeStringKeyedObject) or it just has a prop in its interface (FeObjectwithNamedKeyProp)


export function feGetCollectionEntry <
  T extends _Fe_AnyI = _Fe_AnyI
>(
  collection: TFeAnyCollection<T> | undefined,
  key: __NID | number | T | undefined  // the iterator
) {
  if (!key || !collection) {
    return undefined;  // @TODO or null
  }
  if (collection instanceof WeakMap) {
    return collection.get(key as T);
  }
  if (collection instanceof Map) {
    return collection.get(key as __NID);
  }
  if (collection instanceof Array) {
    return collection[key as number];
  }
  if (feAssertStringKeyedCollectionObject(collection, key as __NID) !== undefined) {
    return collection![key as __NID];
  }
  return undefined;
}

export function feSetCollectionEntry <
  T extends _Fe_AnyI = _Fe_AnyI
>(
  collection: TFeAnyCollection<T>,
  value: T,
  key: __NID | number | T | undefined  // the iterator
) {
  if (!collection) {
    return false;
  }
  // undefined value is also valid
  if (collection instanceof WeakMap && !!key) {
    return !!collection.set(key as T, value);
  }
  if (collection instanceof Map && !!key) {
    return !!collection.set(key as __NID, value);
  }
  if (collection instanceof Array) {
    if (_feIsNumber(key as number) && (key as number) <= collection.length - 1) {
      collection[key as number] = value;
      return collection.length;
    } else {
      return collection.push(value);
    }
  }
  if (feAssertStringKeyedCollectionObject(collection, key as __NID) !== undefined && !!key) {
    // @ts-ignore @TODO
    collection![key as __NID] = value;
    return true;  // @TODO
  }
  return false;
}

export function fePrependEntrytoCollection < // works as expected with Arrays only at this point
  T extends _Fe_AnyI = _Fe_AnyI
>(
  collection: TFeAnyCollection<T>,
  value: T,
  key?: __NID | number | T | undefined  // the iterator
) {
  if (!collection) {
    return false;
  }
  // undefined value is also valid
  if (collection instanceof WeakMap) {
    return feSetCollectionEntry(collection,value,key);
  }
  if (collection instanceof Map) {
    // @TODO might not make any sence if implemented with resetting the whole thing
    return feSetCollectionEntry(collection,value,key);
  }
  if (collection instanceof Array) {
    return collection.unshift(value);
  }
  if (feAssertStringKeyedCollectionObject(collection, key as __NID) !== undefined) {
    return feSetCollectionEntry(collection,value,key);  // @TODO
  }
  return false;
}


export type FeDoesEntryFit =
  (ery: _Fe_AnyI) => boolean | undefined
  ; // tells if an entry fits the criteria for processing


export function feForEachinCollection <
  T extends _Fe_AnyI = _Fe_AnyI,  // @TODO no string
  StringKeyPropName extends FeTKeyof = string,  // @TODO
>(
  collection: TFeAnyCollection<T> | undefined,
  cb: (
    entry: T,
    idx: number | string,
    // doesEntryFit?: FeDoesEntryFit<T,TShape>,
  ) => void,
  doesEntryFit?: FeDoesEntryFit,
  keyPropName?: StringKeyPropName,
) {
  if (!!collection) {
    if (collection instanceof WeakMap) {
      console.warn('[FE/forEachinCollection] Collection is in weakmap so is not iterable'); // @TODO may be helpful to spit some info from the payload
      return false;
    }
    if (!_feIsIterable(collection)) {
      console.warn('[FE/forEachinCollection] Collection is not iterable (neither it is a weakmap)'); // @TODO may be helpful to spit some info from the payload
      return false;
    }
    if (collection instanceof Map) {
      collection.forEach((ey, idx) => {
        if (!doesEntryFit || doesEntryFit(ey)) {
          cb(ey, idx);
        }
      });
      return true;
    }

    else if (collection instanceof Array) {

      collection.forEach((ey, idx) => {
        if (!ey.id) { // @TODO not true for a utility function
          console.log(`[FE/forEachinCollection] collection has no id at item: ${idx}`);  // @TODO whoot?
        }
        if (!doesEntryFit || doesEntryFit(ey)) {
          cb(ey, idx);
        }
      });
      return true;
    } else {

      const _collection = feAssertStringKeyedCollectionObject(collection, keyPropName);
      if (!!_collection) {
        const idx = 0;
        for (let ey of (_collection as unknown as Iterable<T>)) {
          if (!doesEntryFit || doesEntryFit(ey)) {
            cb(ey, idx);
          }
        }
        return true;
      }
    } // else other iterable @TODO
  }
  return false;
}

export default {
  assertStringKeyedCollectionObject: feAssertStringKeyedCollectionObject,
  getCollectionEntry: feGetCollectionEntry,
  setCollectionEntry: feSetCollectionEntry,
  prependEntrytoCollection: fePrependEntrytoCollection,
  forEachinCollection: feForEachinCollection,
}
