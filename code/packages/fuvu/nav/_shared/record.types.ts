import type {
  _KeysofValueTs, _Never2Unknown, _TKeyofRecordT
} from 'fe3';
import type {
  FuComponentsTypemapsSplit, FuFragmentsTypemap_Assert, FuSinglesTypemap_Assert, FuSingleTypes,
} from './types.js';
import type {
  FuResLlTypemaptoLx, FuResLxTypemapfromShlKinds
} from './resource.types.js';
import type {
  _FuFragmentAny, FuAnyComponent, FuFeedTofFragment, FuViewTofFragment
} from '../fragment.js';
import type {
  _FuNavComponentsRecKeys, _FuNavComponentsRecTypes
} from '../sub.js';


export type _FuComponentsTypemapsSplit_Assert < // @TODO fix this
  CompsTypemapsSplit extends FuComponentsTypemapsSplit
> = CompsTypemapsSplit extends [
  infer FragmentsTypemap extends FuFragmentsTypemap_Assert|never,
  infer SinglesTypemap extends FuSinglesTypemap_Assert|never
] ? [
  FragmentsTypemap extends FuFragmentsTypemap_Assert ? FragmentsTypemap : never,
  SinglesTypemap extends FuSinglesTypemap_Assert ? SinglesTypemap : never
] : never;

export type _TComponentsonlyRecord <
  ComponentsKeys extends _TKeyofRecordT = string
> = Record<ComponentsKeys, FuAnyComponent>;
/*type FuComponentsonlyR <
  ComponentsRwBase extends _TComponentsRwBase
> = Omit<ComponentsRwBase, _FuNavComponentsRecKeys>;*/
export type _TComponentsRecordwBase <
  ComponentsKeys extends _TKeyofRecordT = string
> = Record<ComponentsKeys, FuAnyComponent|_FuNavComponentsRecTypes>;

/*
type FuComponentsonlyR <
  ComponentsRwBase extends _TComponentsRwBase<keyof ComponentsRwBase & string>
> = Omit<ComponentsRwBase, _FuNavComponentsRecKeys>;
*/

export type FuShapeofComponentsRec <
  ComponentsRwBase extends _TComponentsRecordwBase<keyof ComponentsRwBase & string>,
> = Omit<ComponentsRwBase, _FuNavComponentsRecKeys>;

export type FuShapeofComponentsRec_Assert <
  ComponentsonlyR extends _TComponentsonlyRecord<keyof ComponentsonlyR & string>
> = ComponentsonlyR;


export type FuFragmentsKeysofComponentsRec <
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  _KeysofValueTs<FuShapeofComponentsRec<ComponentsR>, FragmentsTs> extends infer Keys ?
    Keys extends keyof ComponentsR & string ? Keys : never : never
;

export type FuSinglesKeysofComponentsRec <
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  Exclude<
    Exclude<keyof ComponentsR, _FuNavComponentsRecKeys>,
    FuFragmentsKeysofComponentsRec<ComponentsR, FragmentsTs>
  > extends infer Keys ?
    Keys extends keyof ComponentsR & string ? Keys : never : never
;

export type FuFeedsShxTypemapofComponentsRec <  // short left, short right = Shx, short all
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> = {
  [FgK in FuFragmentsKeysofComponentsRec<ComponentsR, FragmentsTs>]
  : FuFeedTofFragment<ComponentsR[FgK] extends {[K: string]: _FuFragmentAny; }[FgK] ? ComponentsR[FgK] : never>
};

export type FuViewsShxTypemapofComponentsRec <  // short left, short right = Shx
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> = {
  [FgK in FuFragmentsKeysofComponentsRec<ComponentsR, FragmentsTs>]
  : FuViewTofFragment<ComponentsR[FgK] extends {[K: string]: _FuFragmentAny; }[FgK] ? ComponentsR[FgK] : never>
};

export type FuSinglesShxTypemapofComponentsRec <  // (short left by definition) short right
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> = {
  [CompK in FuSinglesKeysofComponentsRec<ComponentsR, FragmentsTs>]
  : ComponentsR[CompK]
};


export type FuFragmentLxTypemapofComponentsRec < // short-left (non-kindlabeled), short-right (fragment names keyed, local) > LL+LR (kindlabeled fqed) merge
  ComponentsRecLrIdString extends string,
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  FuResLxTypemapfromShlKinds<
    ComponentsRecLrIdString,
    FuFeedsShxTypemapofComponentsRec<ComponentsR,FragmentsTs>,
    FuViewsShxTypemapofComponentsRec<ComponentsR,FragmentsTs>
  >
;

export type FuSinglesLxTypemapofComponentsRec <
  ComponentsRecLrIdString extends string,
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  FuResLlTypemaptoLx<
    ComponentsRecLrIdString,
    // never,
    // @ts-ignore @TODO
    FuSinglesShxTypemapofComponentsRec<ComponentsR,FragmentsTs>
    // FuSinglesShxTypemapofComponentsRec<ComponentsR,FragmentsTs>
  >
;

export type FuResLxTypemapofComponentsRec < // as FuFgAllResLlTypemapofComponentsRec but for all components (incl Singles)
  ComponentsRecLrIdString extends string,
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  & _Never2Unknown< FuFragmentLxTypemapofComponentsRec<ComponentsRecLrIdString,ComponentsR,FragmentsTs>>
  & _Never2Unknown< FuSinglesLxTypemapofComponentsRec<ComponentsRecLrIdString,ComponentsR,FragmentsTs>>
;


// Split to Record and Fragments parts:

type $ComponentsR = 0;  // ComponentsR extends FuShapeofComponentsRec_Assert<ComponentsR>
type $FragmentsTs = 1;  // FragmentsTs extends _FuFragmentAny[]

type _ComponentsRecsSplitTuple <
  ComponentsR extends _TComponentsonlyRecord<keyof ComponentsR & string>
>  = [FuShapeofComponentsRec_Assert<ComponentsR>, _FuFragmentAny[]|never];

export type _FuComponentsRecsSplit_Assert <
  CompsRecsSplit extends (
    CompsRecsSplit[$ComponentsR] extends _TComponentsonlyRecord<keyof CompsRecsSplit[$ComponentsR] & string>
      ? _ComponentsRecsSplitTuple<CompsRecsSplit[$ComponentsR]>
      : never
    )
> = CompsRecsSplit extends [
  infer ComponentsR extends _TComponentsonlyRecord,
  infer FragmentsTs extends _FuFragmentAny[]|never
] ? [
  ComponentsR, // extends _TComponentsR<keyof ComponentsR & string> ? ComponentsR : never, // the never should not occur in real cases here
  FragmentsTs, // extends _FuFragmentAny[]? FragmentsTs : never
] : never;

export type _FuComponentsRecsSplitClosure <
  CompsRecsSplit extends (
    CompsRecsSplit[$ComponentsR] extends _TComponentsonlyRecord<keyof CompsRecsSplit[$ComponentsR] & string>
      ? _ComponentsRecsSplitTuple<CompsRecsSplit[$ComponentsR]>
      : never
    ),
  Expression
> =
// CompsRecsSplit extends [
//     infer ComponentsR extends _TComponentsonlyRecord<keyof CompsRecsSplit[$ComponentsR] & string>,
//     infer FragmentsTs extends _FuFragmentAny[]|never
//   ] ?
//   CompsRecsSplit extends _FuComponentsRecsSplit_Assert<[ComponentsR, FragmentsTs]>
//     ?
  Expression
// : never : never
  ;

export type FuComponentsTypemapsSplitofRec_Alt <
  ComponentsRecLrIdString extends string,
  CompsRecsSplit extends (  // @TODO requires FuShapeofComponentsRec downstream to work
    CompsRecsSplit[$ComponentsR] extends _TComponentsonlyRecord<keyof CompsRecsSplit[$ComponentsR] & string>
      ? _ComponentsRecsSplitTuple<CompsRecsSplit[$ComponentsR]>
      : never
    ),
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,
  [
    // @ts-ignore @TODO
    FuFragmentLxTypemapofComponentsRec<ComponentsRecLrIdString,CompsRecsSplit[$ComponentsR],CompsRecsSplit[$FragmentsTs]>,
    Omit< CompsRecsSplit[$ComponentsR],
      | _FuNavComponentsRecKeys
      // @ts-ignore @TODO
      | FuFragmentsKeysofComponentsRec<CompsRecsSplit[$ComponentsR],CompsRecsSplit[$FragmentsTs]>
    >
  ]
>;


/*
type $ComponentsR = 0;  // ComponentsR extends Record<keyof ComponentsR,any>
type $FragmentsTs = 1;  // FragmentsTs extends _FuFragmentAny[]
type _TComponentsR = Record<string,FuAnyComponent>;
type _ComponentsRecsSplitTuple = [_TComponentsR, _FuFragmentAny[]|never];

export type _FuComponentsRecsSplit_Assert <
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = CompsRecsSplit extends [
  infer ComponentsR extends _TComponentsR,
  infer FragmentsTs extends _FuFragmentAny[]|never
] ? [
  ComponentsR extends Record<keyof ComponentsR,FuAnyComponent> ? ComponentsR : never, // the never should not occur in real cases here
  FragmentsTs extends _FuFragmentAny[]? FragmentsTs : never
] : never;

export type _FuComponentsRecsSplitClosure<
  CompsRecsSplit extends _ComponentsRecsSplitTuple,
  Expression
> =
  CompsRecsSplit extends [
      infer ComponentsR extends Record<string,any>|never,
      infer FragmentsTs extends _FuFragmentAny[]|never
    ] ?
    CompsRecsSplit extends _FuComponentsRecsSplit_Assert<[ComponentsR, FragmentsTs]>
      ?
      Expression
      : never :never
  ;


export type FuFragmentsKeysofComponentsRec <
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  _KeysofValueTs<Omit<CompsRecsSplit[$ComponentsR], _FuNavComponentsRecKeys>, CompsRecsSplit[$FragmentsTs]> // @TODO review
>;

export type FuSinglesKeysofComponentsRec <
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  Exclude<
    Exclude<keyof CompsRecsSplit[$ComponentsR], _FuNavComponentsRecKeys>,
    FuFragmentsKeysofComponentsRec<CompsRecsSplit>
  >
>;

export type FuFeedsShxTypemapofComponentsRec <  // short left, short right = Shx, short all
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  CompsRecsSplit[$ComponentsR] extends _TComponentsR ?
    {
      [FgK in FuFragmentsKeysofComponentsRec<CompsRecsSplit>]
      : FuFeedTofFragment<(CompsRecsSplit[$ComponentsR])[FgK extends keyof (CompsRecsSplit[$ComponentsR])? FgK : never]>
    }
    : never
>;

export type FuViewsShxTypemapofComponentsRec <  // short left, short right = Shx
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,
  {
    [FgK in FuFragmentsKeysofComponentsRec<CompsRecsSplit>]
    : FuViewTofFragment<CompsRecsSplit[$ComponentsR][FgK extends keyof CompsRecsSplit[$ComponentsR]? FgK : never]>
  }
>;

export type FuSinglesShxTypemapofComponentsRec <  // (short left by definition) short right
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,
  {
    [CompK in FuSinglesKeysofComponentsRec<CompsRecsSplit>]
    : CompsRecsSplit[$ComponentsR][CompK extends keyof CompsRecsSplit[$ComponentsR]? CompK : never]
  }
>;


export type FuFragmentLxTypemapofComponentsRec < // short-left (non-kindlabeled), short-right (fragment names keyed, local) > LL+LR (kindlabeled fqed) merge
  ComponentsRecLrIdString extends string,
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  FuResLxTypemapfromShlKinds<
    ComponentsRecLrIdString,
    FuFeedsShxTypemapofComponentsRec<CompsRecsSplit>,
    FuViewsShxTypemapofComponentsRec<CompsRecsSplit>
  >
>;

export type FuSinglesLxTypemapofComponentsRec <
  ComponentsRecLrIdString extends string,
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  FuResLlTypemaptoLx<
    ComponentsRecLrIdString,
    FuSinglesShxTypemapofComponentsRec<CompsRecsSplit>
    // FuSinglesShxTypemapofComponentsRec<ComponentsR,FragmentsTs>
  >
>;


export type FuResLxTypemapofComponentsRec < // as FuFgAllResLlTypemapofComponentsRec but for all components (incl Singles)
  ComponentsRecLrIdString extends string,
  CompsRecsSplit extends _ComponentsRecsSplitTuple
> = _FuComponentsRecsSplitClosure<CompsRecsSplit,

  & _Never2Unknown< FuFragmentLxTypemapofComponentsRec<ComponentsRecLrIdString,CompsRecsSplit>>
  & _Never2Unknown< FuSinglesLxTypemapofComponentsRec<ComponentsRecLrIdString,CompsRecsSplit>>
>;
*/