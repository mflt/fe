import type {
  __NID, __FeDefaultKeyPropName,
  _Fe_AnyI, FeObjectwithNamedKeyProp, FeStringKeyedCollectionObject, _Fe_AnyI_theOther,
} from './root.types.js';

export type IFeValue<
  NamedI extends _Fe_AnyI | string = _Fe_AnyI  // string is edge case, interface is the targeted subject
> = NamedI extends string ? string : NamedI;
// any interface or a named business interface,
// fully external to Fe and readonly, immutable from out pov,
// and muting externally which we are to be informed of

// an intermediate form before defining an item
// _ signifies that it should not be used, use either raw or item form
export type IFeValuewithNamedKeyProp< // could've been named valueItem but Item is reserved to the derivative class
  TValue extends IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // @TODO also obj in case of a WeakMap, see IFeShade
> =
  FeObjectwithNamedKeyProp<IFeValue<TValue>, StringKeyPropName, __NID>
  ;
// any or specified interface with unique id

// collections:

export type FeValuesArray<
  TValue extends Exclude<IFeValue, string>,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // undefined 'id' has no meaning here
> =
  IFeValuewithNamedKeyProp<TValue, StringKeyPropName>[] | []
  ; // collection of keyed values

export type FeValuesMap<
  TValue extends IFeValue
> = Map<__NID, TValue>; // collection of raw values

export type FeValuesWeakmap<
  TValue extends IFeValue
> = WeakMap<_Fe_AnyI, TValue>; // collection of raw values indexed by themselves

export type FeValuesIterableObject<
  TValue extends IFeValue,
  KeyPropType extends string = string
> =
  FeStringKeyedCollectionObject<TValue, KeyPropType>
  & Iterable<TValue>;

export type FeValuesAnyIterable<
  TValue extends IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // @TODO
> = Iterable<TValue | [string, TValue]>;
//* note the tuple here

// @TODO WeakMap and Set and Shade embedded

export type FeValuesCollection< // Keyed values' collection
  TValue extends IFeValue,
  AssociationKeyTypeOrName extends string | number | _Fe_AnyI | undefined = undefined,
> =
  AssociationKeyTypeOrName extends undefined
  ?
  FeValuesMap<TValue>
  :
  AssociationKeyTypeOrName extends string
  ? // @TODO not true
  FeValuesIterableObject<TValue> | FeValuesArray<TValue, AssociationKeyTypeOrName> | FeValuesAnyIterable<TValue>
  :
  AssociationKeyTypeOrName extends _Fe_AnyI
  ?
  FeValuesWeakmap<TValue>
  :
  AssociationKeyTypeOrName extends number
  ?
  FeValuesArray<TValue>
  :
  never
  ;


export type FeShadesEntryComputer<  // @TODO Shade part was hid, review
  TValue extends IFeValue,
  TYieldedResult extends /* IFeValueShade<_Fe_AnyI_theOther> | */ IFeValue<_Fe_AnyI_theOther>,
  //* note that this may not follow the TValue, as the TValue may represent a derivative type of the shade's value, like [string,TValue]
  //* _Fe_AnyI_theOther allows to signify that this type differs from the _Fe_AnyI type behind the TValue
  KeyPropType extends string = string,
> = (
  valueEntry: TValue | null | undefined,
  key?: __NID,
  iterationIdx?: number,
) => TYieldedResult | null;


// Functions

export type FeFindInValuesCollectionFn< // in-strand
  TValue extends IFeValue,
// IdKey extends string | undefined = __FeDefaultKeyPropName
> =
  (idxOrItem: __NID | number | TValue) => TValue;  // can be an object itself in a pass tru case, @TODO see also WeakMap case
// number/idx is not implemented yet @TODO

// @TODO toShade

/* export type FeCellPyl2ShadeFn<TCellPyl extends IFeCellNothingYet> = // @TODO ?
  (idxOrPyl: __IFeCustomCell['id'] | number | TCellPyl) => __IFeCustomCell
  ; */
