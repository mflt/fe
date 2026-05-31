import type {
  _PrefixLiteralwithSeparator, _Never2Unknown,
} from 'fe3';
import type {
  FuEResourcekindsKeys, FuResourcekindsKeyStrings, FuEResourceidSeparators,
} from './strings.js';
import type {
  FuFeedTypes, FuViewTypes, FuSingleTypes, FuResLlTypemap_Assert, FuSinglesTypemap_Assert,
} from './types.js';


// ResourceId, Typemap -- see the explanation in types.ts

/*export type FuExtractLabeledTypemapofKind <  // local from local, fq from fqed
  ResourcekindKey extends FuResourcekindsKeyStrings, // works for a fixed (chosen) resource kind, feed or view or single or any singular key, no union
  TypemapLocOrFqofFixedResourceKind extends Record<keyof TypemapLocOrFqofFixedResourceKind,FuFeedTypes|FuViewTypes|FuSingleTypes>,
>  =
  TypemapLocOrFqofFixedResourceKind extends Record<string, Exclude<any,undefined>> ?  // @TODO record type
    {
      [Rid in _PrefixLiteralwithSeparator<ResourcekindKey, keyof TypemapLocOrFqofFixedResourceKind & string, FuEResourceIdSeparators.AtKindKey>]:
      Rid extends `${infer _RK}${FuEResourceIdSeparators.AtKindKey}${infer FragmentNameLocOrFq}`
        ? TypemapLocOrFqofFixedResourceKind[FragmentNameLocOrFq extends keyof TypemapLocOrFqofFixedResourceKind ? FragmentNameLocOrFq : never]
        : unknown
    } : unknown
;*/ // seems to be a reproducing itself thing

export type FuAllResLlTypemapfromLlKinds< // Kindlabeled (long left) only, local or fqed
  FeedsLlTypemap extends Record<keyof FeedsLlTypemap & string, FuFeedTypes>,
  ViewsLlTypemap extends Record<keyof FeedsLlTypemap & string, FuViewTypes>
    = FeedsLlTypemap extends Record<string, unknown> ? Record<keyof FeedsLlTypemap & string, FuViewTypes> : never, // that's how fragments are
  SinglesTypemap extends FuSinglesTypemap_Assert = never
> =
  FeedsLlTypemap & ViewsLlTypemap & _Never2Unknown<SinglesTypemap>
;


export type FuResLlTypemapfromShlKinds < // Short left aka non-kindlabeled (fragment names keyed) > kindlabeled merge; local from local, fq from fqed
  FeedsShlTypemap extends Record<keyof FeedsShlTypemap & string, FuFeedTypes>,
  ViewsShlTypemap extends Record<keyof FeedsShlTypemap & string, FuViewTypes>
    = FeedsShlTypemap extends Record<string, unknown> ? Record<keyof FeedsShlTypemap & string, FuViewTypes> : never, // that's how fragments are; never will only occur when Feeds are ill too
> =
  {
    [Rid in
      _PrefixLiteralwithSeparator<  // long left resource id
        | `${FeedsShlTypemap extends Record<string, unknown> ? `${FuEResourcekindsKeys.Feed}` : never}`
        | `${ViewsShlTypemap extends Record<string, unknown> ? `${FuEResourcekindsKeys.View}` : never}`,
        keyof FeedsShlTypemap & string,
        FuEResourceidSeparators.AtKindlabel
      >
    ]:
    Rid extends `${infer ResourceKind}${FuEResourceidSeparators.AtKindlabel}${infer FragmentId_NameOrFq}` & string
      ?
      ResourceKind extends `${FuEResourcekindsKeys.Feed}`
        ?
        FragmentId_NameOrFq extends keyof FeedsShlTypemap & string ? FeedsShlTypemap[FragmentId_NameOrFq] : never  // FeedsTypemap[FragmentId_NameOrFq] exists due to the logic of Rid generation
        :
        ResourceKind extends `${FuEResourcekindsKeys.View}`
          ?
          FragmentId_NameOrFq extends keyof ViewsShlTypemap & string ? ViewsShlTypemap[FragmentId_NameOrFq] : never
          : never
          // if more than three kinds then extend, like w functions
      : never
  }
;


export type FuResLlTypemaptoLx < // Longleft is assumed, will work with Singles only too
  ComponentsRecordLrIdString extends string,
  ShrTypemap extends Record<keyof ShrTypemap & string, FuFeedTypes|FuViewTypes|FuSingleTypes>
>  =
  {
    [Rid in _PrefixLiteralwithSeparator<  // fully qualified resource id
      keyof ShrTypemap & string,
      ComponentsRecordLrIdString,
      FuEResourceidSeparators.AtSubspace
    >]:
    Rid extends `${infer ResourceShrIdOrName}${FuEResourceidSeparators.AtSubspace}${infer _SubspaceKey}` & string
      ?
      ResourceShrIdOrName extends keyof ShrTypemap & string? ShrTypemap[ResourceShrIdOrName] : never // @TODO which expression pattern is better, this or one with FragmentId_NameOrFq above?
      : never
  }
;

/*
export type FuResLlTypemaptoLx < // Longleft is assumed, will work with Singles only too
  ComponentsRecordLrIdString extends string,
  FragmentsShrTypemap extends Record<
    keyof FragmentsShrTypemap & string,
    FuFeedTypes|FuViewTypes
  >,
  SinglesShrTypemap extends FuSinglesTypemap_Assert = never
  // ShrTypemap extends Record<keyof ShrTypemap & string, FuFeedTypes|FuViewTypes|FuSingleTypes>
>  =
  & {
    [Rid in _PrefixLiteralwithSeparator<  // fully qualified resource id
      (keyof FragmentsShrTypemap | keyof SinglesShrTypemap) & string,
      ComponentsRecordLrIdString,
      FuEResourceidSeparators.AtSubspace
    >]:
    Rid extends `${infer ResourceShrIdOrName}${FuEResourceidSeparators.AtSubspace}${infer _SubspaceKey}` & string
      ?
      ResourceShrIdOrName extends keyof FragmentsShrTypemap & string
        ? FragmentsShrTypemap[ResourceShrIdOrName]
        : ResourceShrIdOrName extends keyof SinglesShrTypemap & string
        ? SinglesShrTypemap[ResourceShrIdOrName] // @TODO which expression pattern is better, this or one with FragmentId_NameOrFq above?
      : never : never
  }
;

 */

export type FuResLxTypemapfromShlKinds < // non-kindlabeled (fragment names keyed, short left) local > kindlabeled fqed merge
  ComponentsRecordLrIdString extends string,
  FeedsShlTypemap extends Record<keyof FeedsShlTypemap & string, FuFeedTypes>,
  ViewsShlTypemap extends Record<keyof FeedsShlTypemap & string, FuViewTypes>
    = FeedsShlTypemap extends Record<string, unknown> ? Record<keyof FeedsShlTypemap & string, FuViewTypes> : never, // that's how fragments are
> =
  // FuResLlTypemapfromShlKinds<FeedsShlTypemap,ViewsShlTypemap,SinglesTypemap>
  FuResLlTypemaptoLx<
    ComponentsRecordLrIdString,
    FuResLlTypemapfromShlKinds<FeedsShlTypemap,ViewsShlTypemap>
    // SinglesTypemap
  >
;


export type FuComponentsNamesfromAllResLlTypemap < // FQ or local from FQed or local typemap @TODO names or id-s, whichever is more significant in use
  AllResLlTypemap extends FuResLlTypemap_Assert<AllResLlTypemap,SinglesTypemap>,
  SinglesTypemap extends FuSinglesTypemap_Assert = never
>  =
  AllResLlTypemap extends Record<string, unknown>
    ?
      keyof AllResLlTypemap extends infer Rid
        ? Rid extends `${infer _RK}${FuEResourceidSeparators.AtKindlabel}${infer FragmentId_NameOrFq}`
          ? FragmentId_NameOrFq
          : Rid // case of SingleType
        : never
    :
    never
;

export type FuComponentsIdsfromTypemapsDuo < // FQ or local from FQed or local typemap
  FragmentsTypemap extends Record<
    keyof FragmentsTypemap & string,
    FuFeedTypes|FuViewTypes
  >,
  SinglesTypemap extends FuSinglesTypemap_Assert = never
>  =
  | (
    keyof FragmentsTypemap extends `${infer _RK}${FuEResourceidSeparators.AtKindlabel}${infer FragmentsIds_NameOrFq}` ?
      FragmentsIds_NameOrFq extends string ? FragmentsIds_NameOrFq : never : never
  )
  | (
    keyof SinglesTypemap extends infer SinglesIds_NameOrFq ? SinglesIds_NameOrFq : never
  )
;


export type _FuCombineResourceidsforFixedKind <  // Feed and View (Fragments) only; @TODO wip
  ResourcekindKey extends FuResourcekindsKeyStrings, // fixed (chosen) resource kind, feed or view or single or any singular key, no union intended (though would work with multiple)
  FragmentsIds_NameOrFq extends string, // local or fqed, single or multiple (union)
> =
  _PrefixLiteralwithSeparator<
    ResourcekindKey,
    FragmentsIds_NameOrFq,
    FuEResourceidSeparators.AtKindlabel
  >
;

export type FuComponentsFqIdsfromNames <  // incl SinglesNames
  ComponentsRecordLrIdString extends string,  // @TODO actually component record fq id is either sub's name alone (short) or includes a prepended space name (long) - so when it becomes fq it also extends to the left, thus LR only means that as the right part of a future resource id it is long
  FragmentsAndSinglesNames extends string,
> =
  _PrefixLiteralwithSeparator<
    FragmentsAndSinglesNames,
    ComponentsRecordLrIdString,
    FuEResourceidSeparators.AtSubspace
  >
;

/*export type FuKeyTbyFragmentsNames <
  FragmentsNames extends string, // local or fqed
  T,
> = {
  [FragmentName in FragmentsNames]: T
};*/
