import type {
  __NID, __FeDefaultKeyPropName,
} from '../_integration/types.js';
import type {
  _Fe_AnyI, FeObjectwithNamedKeyProp, _Fe_AnyI_theOther,
} from '../../../_fe/code/packages/core-types/root.types.d.ts';
import type {
  IFeValue,
} from '../../../_fe/code/packages/core-types/value.i-f.d.ts';
import type { _ExtractTypesUnionfromIndexed, } from '../../../_fe/code/packages/core-types/helper.types.d.ts';
import type { feGetCollectionEntry, } from '../../../_fe/code/packages/collections/collections.js';
import type {
  IFeValueShade, FeValueShadesArray, FeValueShadesMap, FeValueShadesWeakmap,
  FeValueShadesCollection, FeValueShadesIterableObject, IFeValueShadewithNamedKeyProp,
} from './shade.i-f.js';
import type { IFeReactiveBeat } from '../beat/beat.i-f.js';


// Shapes are value shades with view/templating types
// Being shades with defined purpose (ui support) these are the mutable/mutating props added to
// the values which latter are handled as immutable external entities by this library

type _FeShapeMarkers_only = {  // @TODO
  // helper flags
  scrollIdxPresent?: boolean,
  shapesAreWeakmap?: boolean,
  shapesAreArray?: boolean,
  shapesResetOnValuesReset?: boolean,
  iterableByShapes?: boolean, // configuring a strand with undefined values will set this to true
  stickyShapes?: boolean, // not yet implemented
};

export interface IFeShape<
  TValue extends IFeValue = IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName,
  TBeat extends number | __NID | { [K: string]: number } = IFeReactiveBeat['beat']
> extends IFeValueShade<TValue, StringKeyPropName, TBeat> {
  markers?: IFeValueShade['markers'] & _FeShapeMarkers_only,
  attributes?: {}, // aka unknown which should've been HTMLSpanElement, though we wont include the DOM types in tsconfig just for this
    // major attributes, spread the ui attributes here, see @open-wc/lit-helpers/spread
  refs?: { // @TODO make it defined downstream
    // valueRef does not belong here
    // selfRef?: TFeManifestRefLIElementT,
    // group?: TFeManifestElement,
    // childRef?: TFeManifestRefSpanElementT,
    // strand?: TFeManifestElement,
    domKey?: string,
    slotName?: () => string,
  },
  idxs?:
    IFeValueShade<TValue, StringKeyPropName, TBeat>['idxs'] // a place for shape's internal and manual beat implementation just in case
    & {
      // valueId does not belong here
      inFlow?: number,
      viewOrder?: number,
      collectionEntryKey?: Parameters<typeof feGetCollectionEntry>[1],  // the key of this shape in the shapes collection
    },
  styling?: {
    css?: {}, // @TODO css attribs, maybe lit's Readonly<StyleInfo>
    icon?: unknown, // @TODO
  },
  // valuePartfrom3?: FeValuePartfromTripletGentr<TValue,IFeShape>,
  renderer?: unknown, // ui render function to produce RenderResult @TODO
  // groups is implemented in shape
}

export type IFeShapewithNamedKeyProp<
  TShape extends IFeShape<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
> =
  FeObjectwithNamedKeyProp<TShape, StringKeyPropName, __NID>
  ;

// Collections:

// NOTE: the below is supposed to mimic the typing for shade and so the FeShapesCollection type is just alias for the shade version
export type FeShapesArray<
  TShape extends IFeShape<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // 'id' is to be defined
> = FeValueShadesArray<TShape, StringKeyPropName>;
export type FeShapesMap<
  TShape extends IFeShape,
> = FeValueShadesMap<TShape>;
export type FeShapesWeakMap<
  TShape extends IFeShape,
> = FeValueShadesWeakmap<TShape>;
export type FeShapeIterableObject<
  TShape extends IFeShape<IFeValue>,
  KeyPropType extends string = string
> = FeValueShadesIterableObject<TShape, KeyPropType>;
export type FeShapeAnyIterable<
  TShape extends IFeShape,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // @TODO
> = Iterable<TShape>;
export type FeShapesCollection<
  TShape extends IFeShape<IFeValue, Exclude<AssociationKeyTypeOrName, _Fe_AnyI | undefined>>,
  AssociationKeyTypeOrName extends string | _Fe_AnyI | undefined = undefined  // Note: default is Map, @TODO number?
> = FeValueShadesCollection<TShape, AssociationKeyTypeOrName>
  ;

// Triplet is assumed to be used internally while shapes are prepared and so we can not rely on the shape object itself
// Otherwise a shape carries a reference of its corresponding value itself
// The idx prop of the triplet is safely present already as value.id/key or shade.idx/something

export type IFeTriplet<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> = {
  value?: TValue,
  shape?: TShape,
  idx?: IdxPropType,
};

export type FeTripletsArray<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> = Array<IFeTriplet<TValue, TShape, IdxPropType>>
  ;

// Model functions

export type FeShapePartfromTripletGentr<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> =
  (triplet: IFeTriplet<TValue, TShape, IdxPropType>) => IFeShape<TValue>
  ;

export type FeValuePartfromTripletGentr<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> =
  (triplet: IFeTriplet<TValue, TShape, IdxPropType>) => IFeValue
  ;

export type FeDoesTupleFit<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> =
  (triplet: IFeTriplet<TValue, TShape, IdxPropType>) => boolean | undefined
  ;

export type FeGroupIdsfromTripletGentr<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  IdxPropType extends string | number | undefined = string,
> =
  (triplet: IFeTriplet<TValue, TShape, IdxPropType>) => __NID[] | undefined
  ;


export type IFeTripletHelpers<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
> = {
  shapePartfrom3?: FeShapePartfromTripletGentr<TValue, TShape>,
  valuePartfrom3?: FeValuePartfromTripletGentr<TValue, TShape>,
  valueBasedKeyfrom3?: (
    triplet: IFeTriplet<TValue, TShape>,
    inFlowIdx: number,  // which is idxs.inFlow then // @TODO ?
  ) => __NID,
  compareFninSort?: Parameters<Array<_ExtractTypesUnionfromIndexed<FeTripletsArray<TValue, TShape>>>['sort']>[0] | true
  // * true means using Array.sort w/o a specific compare fn.
};
