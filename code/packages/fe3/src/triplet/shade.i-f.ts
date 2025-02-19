import type { 
  __NID, __FeDefaultKeyPropName,
  _Fe_AnyI, _Fe_AnyI_theOther, FeObjectwithNamedKeyProp, FeStringKeyedCollectionObject, 
} from '../../../_fe/code/packages/core-types/root.types.js';
import type { 
  IFeValue, 
} from '../../../_fe/code/packages/core-types/value.i-f.js';
import type { IFeReactiveBeat } from '../beat/beat.i-f.js';


export type FeShadeMarkers = {
  // flags to indicate IFeItem association with values and so
  valuesById?: boolean,  // association by 'id' key present in both values and shades; not used by the lib
  valuesInMap?: boolean,  // not used by the lib, rather checked as instanceof  @TODO Are
  valuesInIdxOrder?: boolean,  // [not implemented] meaning that the raw values collection is an ordered array and markers are arranged in the same order
  valueIsString?: boolean,
  valuesInWeakmap?: boolean,
  valueShadesInArray?: boolean,
  valueShadesInWeakmap?: boolean,
};

// Shade

export type IFeValueShade<
  TValue extends IFeValue = IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // main purpose is to name the id prop, 'id' or 'key' or,
  TBeat extends number | __NID | { [K: string]: number } = IFeReactiveBeat['beat']
> = {
  markers?: FeShadeMarkers, // flags
  valueRef?: TValue,  // aka record, doc, business data object
  getValueRef?: (...arg: any) => TValue | undefined,
  valueId?: __NID,  // @TODO
  idxs?: {
    inValuesCollection?: number,
  },
  valueType?: string, // in case the collection carries different types, and this simple string "guard" helps the processing
  pylDigest?: __NID,  // payload / the corresponding value's content digest / fingerprint - user implemented, like eg. FVM hash (npm i fnv1a)
  groups?: __NID[], // plural, to allow a shade/shape be part of multiple groups, in case of single relationship use this tuple as a container for one
  extra?: _Fe_AnyI_theOther, // convenience keys or extra record
}
  & Partial<IFeReactiveBeat<TBeat>>
  ;

export type IFeValueShadewithNamedKeyProp<
  TValueShade extends IFeValueShade<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
> =
  FeObjectwithNamedKeyProp<TValueShade, StringKeyPropName, __NID>
  ;

// collections:

export type FeValueShadesArray<
  TValueShade extends IFeValueShade<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // 'id' is to be defined
> =
  IFeValueShadewithNamedKeyProp<
    TValueShade,
    StringKeyPropName
  >[]; // can be complicated with injecting the value's key prop name
// * assumes that the iterable thing is an id which is one of the props in shade itself, also possibly shared with the value interface so the association

export type FeValueShadesMap<
  TValueShade extends IFeValueShade,
> =
  Map<
    __NID,  // the association key, the iterable
    TValueShade
  >;

export type FeValueShadesWeakmap<
  TValueShade extends IFeValueShade,
> =
  WeakMap<
    Exclude<TValueShade['valueRef'], undefined>, // the association is by the value objects
    TValueShade
  >;  // @TODO if important to define TValue which is the association idx

/*export type FeValueShadesCollection<
  TValueShade extends IFeValueShade,
  AssocKey extends string | _Fe_AnyI | undefined = _FeDefaultKeyofId
> = TValueShade extends { markers: { valueShadesInArray: true } } // Default FeShade is Map, unlike values
  ? FeValueShadesArray<TValueShade, Exclude<AssocKey, _Fe_AnyI | undefined>>
  : TValueShade extends { markers: { valueShadesInWeakmap: true } }
  ? FeValueShadesWeakmap<TValueShade>
  : FeValueShadesMap<TValueShade>
  ;*/

export type FeValueShadesIterableObject<
  TValueShade extends IFeValueShade<IFeValue>,
  KeyPropType extends string = string
> =
  FeStringKeyedCollectionObject<TValueShade, KeyPropType>
  & Iterable<TValueShade>;
// * the iterable association key in this case is the prop of the collection not the shade itself

export type FeValueShadesAnyIterable<
  TValueShade extends IFeValueShade,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // @TODO
> = Iterable<TValueShade>; // @TODO explain Object with key

export type FeValueShadesCollection< // Keyed value-shades' collection
  TValueShade extends IFeValueShade<IFeValue, Exclude<AssociationKeyTypeOrName, _Fe_AnyI | undefined>>,
  AssociationKeyTypeOrName extends string | _Fe_AnyI | undefined = undefined,
> =
  AssociationKeyTypeOrName extends undefined
  ?
  FeValueShadesMap<TValueShade>
  :
  AssociationKeyTypeOrName extends string //  Note array here is supposed to hold an association key (no number association key)
  ? // @TODO not true
  FeValueShadesIterableObject<TValueShade, AssociationKeyTypeOrName> | FeValueShadesArray<TValueShade, AssociationKeyTypeOrName> | FeValueShadesAnyIterable<TValueShade>
  :
  AssociationKeyTypeOrName extends _Fe_AnyI
  ?
  FeValueShadesWeakmap<TValueShade>
  :
  never
  ;

// *IFeItem* is an alternative to IFeShade interface behind a view element which can cary the business logic related model data (values)
// by obj reference, id association or in itself. It can also convey any helper property or method.
/* @TODO xox Marker is not important (?) Marker may contain valueByRef, valueById, valueByString props which or their lack of specifies the mode of association
  of this view related item with value item. */

  export class CFeItem<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | number | undefined = __FeDefaultKeyPropName, // the 'id' in values if those aren't a Map
> {
  idx: string | number;

  constructor(
    public value: TValue,
    public shade: TValueShade,
    idKey?: StringKeyPropName,  // IdKey extends 'id'? string : IdKey, // @TODO
  ) {
    this.idx = this.value[idKey || 'id'];  // @TODO
  }
}

export type FeItemsArray<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | undefined = __FeDefaultKeyPropName  // 'id' is to be defined
> = CFeItem<TValue, TValueShade, StringKeyPropName>[];

export type FeWeakItemsMap<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade,
> = WeakMap<TValue, TValueShade>;

export type Fe2ItemFn< // in-strand
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | undefined = __FeDefaultKeyPropName
> =
  (id: __NID) => CFeItem<TValue, TValueShade, StringKeyPropName>;  // infere idx number @TODO

/* FeItem legacy:
  MarkersI extends { valueByRef: true } | { valueIsString: true } ?
  _IFeValueKeyed<{ value?: TValue } & ExoticPartI, MarkersI> :  // the value field then points to a value obj or is a string
  MarkersI extends { valueById: true } ?
  TValue extends { id: _NID } ? // we assume that an IFeItem's id matches a TValue.id
  _IFeValueKeyed<ExoticPartI, MarkersI> :  // TValue is ignored otherwise than checking the id in it
  never // association by id is not possible, or use 'id' to designate your value item's id
  :
  MarkersI extends { valuesInMap: true } ?
  _IFeValueKeyed<ExoticPartI, MarkersI> :
  // * markers map associated with a map of values, and IFeItem itself eqs to IFeMarkedValue<almost{},MarkerI>
  _IFeValueKeyed<TValue & ExoticPartI, MarkersI>   // just another representation of IFeMarkedValue
  ; // thus if no valueByRef or valueById if provided than it's
//... a: the case that you use FeItems to hold your business data
//... b: valueT arg is used to point to a map, which is not value itself but a container of values associated by ids with the items
*/

// export type CStrandvalueExtender = (value: PromptStrandsvalue);
