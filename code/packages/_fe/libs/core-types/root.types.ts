// This file contains types which dont strictly implement Fe concepts

// import type { _X_NID } from '../../../../fe3/src/_integration/types.js';
// type _X_NID = string|symbol|object

declare global {
  type _X_NID = string
  type _X_FeDefaultKeyPropName = 'id'
}


export type __NID <
  _NID extends string = string
> = 
  [_X_NID] extends [Function] 
  ? _NID 
  : _X_NID
  ;
// This hack serves a solution to use an external UID for all keys uniquely identifying 
// / objects. @TODO (if it wasn't a .d.ts an unresolved type error should arise)
// / using Function in condition is a hack, other types may also fit the purpose tho

export type __FeDefaultKeyPropName <
 _FeDefaultKeyPropName extends string = string
> = 
  [_X_FeDefaultKeyPropName] extends [Function] 
  ? _FeDefaultKeyPropName 
  : _X_FeDefaultKeyPropName
  ;  
// cf. _FeDefaultKeyPropName

export type FeTKeyof = keyof any;
export type FeTEmptyObject = Record<string|symbol,never>;  // @TODO cf {}

export type _Fe_AnyI = {  // @TODO infer keys from T maybe
  [VK: string]: any,  // @TODO unknown
};
// * @TODO cf type Record<K extends keyof any, T> = { [P in K]: T; }
export type _Fe_AnyI_theOther = {  // @TODO infer keys from T maybe
  [VK: string]: any,
};

export type FeAnyI = Record<FeTKeyof|never|symbol,unknown|never>|{}
export type FeAnyOtherI = Record<FeTKeyof,unknown|never|any>|{}

// * any kind of generic interface (an ephemeral convenience type)


export type FeStringKeyPropPartofObject <
  KeyPropName extends string, // default is assigned upstream @TODO ?
  ID = __NID
> = {
    [Key in `${KeyPropName}`]: ID
  };
// * For merging purposes

export type FeObjectwithNamedKeyProp <
  T extends _Fe_AnyI,
  KeyPropName extends string, // default is assigned upstream @TODO ?
  ID = __NID
> = T & FeStringKeyPropPartofObject<KeyPropName, ID>
// * Used as an entry of arrays

export type FeStringKeyedCollectionObject<
  T extends unknown,
  KeyPropType extends FeTKeyof = string,  // see definition of Record
> =
  Record<KeyPropType, T>
  ;
/*= {
  [Key in `${KeyPropName}`]: T  // All other props are supposed to be language internals, like symbols
};*/
// * Used in iterable object type collections in conjunction with Iterable<T>


/*
export type _FeIdxPartofI<
  Idx extends string | undefined | number, // default is assigned upstream
  T = NID
> =
  Idx extends string
  ?
  { [Key in `${Idx}`]: T }
  :
  {}  // number too
  ;
*/

/*
export type _FeIdxPartofIinclNum< // of an interface
  FeDefaultIdxKey extends string,
  Idx extends string | number | undefined = FeDefaultIdxKey, // @TODO also obj in case of a WeakMap
> =
  Idx extends number
  ? { idx?: number } // is not implemented yet
  : _FeIdxPartofI<Idx>
  ;
*/

/*export type _FeSilentIdxKey< // @TODO makes the consumer think that idx is a string if no Idx is defined
  IdKey extends string | undefined = _FeDefaultKeyPropName,
> = IdKey;

export type _FeSilentIdxKeyInclNum< // @TODO
  IdKey extends string | number | undefined = _FeDefaultKeyPropName,
> = IdKey;*/
