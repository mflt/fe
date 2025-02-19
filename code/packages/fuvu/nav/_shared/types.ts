import type { 
  IFeShape, _ExtractTypesfromRecord, FeTEmptyObject,
} from 'fe3';
import type {
  CFeStrandViewmodel, FeSequencerOutletWc, FeSequencerGroupedOutletWc, ComposeStrandVmClassBase, FeElementBaseWc, FeElLocation,
} from 'fevmi';
import type {
  FuEResourcekindsKeys, FuEResourceidSeparators,
  FuEPacketSubspacesIdsUnion, FuEPacketFragmentsTypemap, FuEPacketSinglesTypemap,
  FuEPacketAllResTypemap, FuEPacketAllResKeys, $fu,
} from './strings.js';

// @TODO Temporary:
import { SpectrumElement, } from 'fevmi/spectrum';

// Misc:

export type FuViewLocation = FeElLocation<HTMLElement> & { // see typescript returns Element from queries
  fallback?: FuViewLocation,
  skipFallback?: boolean,
}

// Resource:

export interface FuFragmentSharedProps {
  // fragment: FuFragment<FuFeedTypes,FuViewTypes>,  // a getter
}

export interface FuFeedBaseProps {
  resourceId?: ()=> FuFeedResourceidLike, // @TODO anchor ?
}

export interface FuViewBaseProps {
  resourceId?: ()=> FuViewResourceidLike,
  // feed: FuFeedTypes,
}

export type FuFeedTypes = // these need to be a collection of feed-like types
  & (
    // add a generic helper to explicitly make anything identifiable as a feed wo letting anything implicitly sneak in
    FeSequencerGroupedOutletWc<{},{},{}>|
    FeSequencerOutletWc<{},{},IFeShape<{}>|undefined>|
    CFeStrandViewmodel<{},{},IFeShape<{}>|undefined>|
    InstanceType<ReturnType<typeof ComposeStrandVmClassBase<{},{},IFeShape<{}>|undefined,{}>>>
  ) // should not include unknown or undefined
  & FuFeedBaseProps & FuFragmentSharedProps
; // @TODO
export type FuViewTypes = (FeElementBaseWc|SpectrumElement) & FuViewBaseProps & FuFragmentSharedProps; // @TODO types, see criteria above, why no HTMLElement only in Single below?
export type FuFragmentsTypemap_Assert = Record<string, FuFeedTypes|FuViewTypes>;

export type FuComponentsUnitProps_nonMangledKey = string|undefined; // easier to add undefined here, considering the implementation, recheck on updates
export type FuComponentsUnitProps_Base = {
  // these are singular values, in case the component instance is reused in multiple subspaces a different mechanism should be in place, like assign a weakmap
  componentName?: string,
  nonMangledKey?: FuComponentsUnitProps_nonMangledKey,
  location?: FuViewLocation,  // parent node to attach to
  // lastParentLocation?: FuComponentsSharedProps_initialParentLocation,
};

export type FuSingleTypes =
  & (
    | FeElementBaseWc
    | SpectrumElement
    | HTMLElement
  )
  & {
    [$fu]?: FuComponentsUnitProps_Base,
  }
; // @TODO Component types

export type FuSinglesTypemap_Assert = Record<string, FuSingleTypes>;
export type FuAllResTypemap_Assert = Record<string, FuFeedTypes|FuViewTypes|FuSingleTypes>;


// Typemap:

// @TODO probably use _RecordStringKeyed_Assert

// like: FeedsTypemap: { 'apple': FTA, 'banana': FTB ... } ; ViewTypemap: { 'apple': VTA, 'banana', VTB ... } where apple and banana are the fragment names
// or Combined/kindlabeled: { 'feed@apple': FTA, 'feed@banana': FTB, 'view@apple': VTA, 'view@banana', VTB ... }
// Feeds and Views share fragmentNames, we expect [fragmentName]: FeedA and [fragmentName]: ViewA to exist,
// thus keyof Feeds = keyof Views = [FragmentNames]
// Singles are normal components external to the Feed/View/Fragment model, their keys we sometime call ComponentNames or SingleNames
// SinglesTypemap is keyed by SinglesIds / keyof Singles only, no kind-labels involved (never long left, always short left)
// Fragments and Singles are together Components

// Below are the basic types using simple logic, others see in resource-typemap.ts

// ResourceId:  [ResourceKindlabel]@[FragmentName]/[Space.Subspace aka spaceId] - implies longleft
// 'Long left' (LL) aka 'Kind labeled' -- if [ResourceKindlabel]@ prefix is present, ResourceId is kind labeled, FragmentName is not
// 'Local' (short right), meaning no 'space.subspace' tailing part added, like ['feed@messages': MFT, 'view@log': LVT, ...]
// if added then that is 'Fully qualified' (FQed) aka 'long right', kind labeled or not:
// FragmentId can be FragmentNameLocal only or if fqed with spaceId than that is the computed fqFragmentId (FragmentNameLr)


export type FuResLlTypemap_Assert <  // (LL = long left) local from local, fq from fqed, Feed/View keyed by kindlabeled (!) resourceIds, Singles keyed by SinglesIds
  LlTypemap_ResourceidsOrSinglesbyNamesOrFq extends Record<
    keyof LlTypemap_ResourceidsOrSinglesbyNamesOrFq & string,
    FuFeedTypes|FuViewTypes|_ExtractTypesfromRecord<SinglesTypemap>
  >,
    // Constrains what key/type pairs can play; SingleTypes via SinglesTypemap must be provided separately since if they weren't, that would allow any object type
  SinglesTypemap extends FuSinglesTypemap_Assert = never
> =
  & {
    [K in (Exclude<keyof LlTypemap_ResourceidsOrSinglesbyNamesOrFq & string, keyof Exclude<SinglesTypemap,never> & string> extends
    infer FVK ? FVK & string : never)]:
    FuFeedTypes|FuViewTypes
    // Record<keyof LlTypemap_ResourceidsOrSinglesbyNamesOrFq & string, FuFeedTypes|FuViewTypes|_ExtractTypesfromRecord<SinglesTypemap>>
  }
  & (SinglesTypemap extends FuSinglesTypemap_Assert
    ? {
      [SK in keyof Exclude<SinglesTypemap,never> & string]:
      _ExtractTypesfromRecord<SinglesTypemap>
    }
    : unknown
  )
;
// see also FuResLlTypemapfromShlKinds, which is the generator of the Fragments related part
// the & {} & {} pattern might be prone to results in strange [x: `feed...` ... results in edge circumstances


export type FuResLlTypemapforOneFragment < // local from local, fq from fqed; Fqed ones go to nav map
  OneFragmentId_NameOrFq extends string,
  Feed extends FuFeedTypes,
  View extends FuViewTypes
> =
  { [Rid in (
    | `${FuEResourcekindsKeys.Feed}${FuEResourceidSeparators.AtKindlabel}${OneFragmentId_NameOrFq}`
    | `${FuEResourcekindsKeys.View}${FuEResourceidSeparators.AtKindlabel}${OneFragmentId_NameOrFq}`) & string]:
    Rid extends `${infer ResourceKind}${FuEResourceidSeparators.AtKindlabel}${infer _FragmentId}` & string ?
      ResourceKind extends `${FuEResourcekindsKeys.Feed}`
        ? Feed
        : View
      : never
  }
;


export type FuTypemapSplitforOneSingle < // @TODO wip, local from local, fq from fqed; Fqed ones go to nav map
  OneSingleId_NameOrFq extends string,
  SingleT extends FuSingleTypes
> = {
  [FuEPacketSubspacesIdsUnion]: OneSingleId_NameOrFq,
  [FuEPacketFragmentsTypemap]: Record<string, any>,  // @TODO why cant it be FeTEmptyObject?
  [FuEPacketSinglesTypemap]: {
    [SK in `${OneSingleId_NameOrFq}`]: SingleT
  },
  [FuEPacketAllResTypemap]: FuComponentsTypemapsSplit[FuEPacketSinglesTypemap],
  [FuEPacketAllResKeys]: FuComponentsTypemapsSplit[FuEPacketAllResKeys]; // fragment's keys or empty is never
}; // satisfies FuComponentsTypemapsSplit
// SK in keyof Exclude<SinglesTypemap,never> & string


export type FuTypemapSplitforOneFragment < // local from local, fq from fqed; Fqed ones go to nav map
  OneFragmentId_NameOrFq extends string,
  Feed extends FuFeedTypes,
  View extends FuViewTypes
> = {
  [FuEPacketSubspacesIdsUnion]: OneFragmentId_NameOrFq,
  [FuEPacketFragmentsTypemap]:
    & { [FK in `${FuEResourcekindsKeys.Feed}${FuEResourceidSeparators.AtKindlabel}${OneFragmentId_NameOrFq}`]: Feed }
    & { [VK in `${FuEResourcekindsKeys.View}${FuEResourceidSeparators.AtKindlabel}${OneFragmentId_NameOrFq}`]: View }
  ,
  [FuEPacketSinglesTypemap]: FeTEmptyObject, // Fragment has no singles, as it's the opposite of Single
  [FuEPacketAllResTypemap]: FuComponentsTypemapsSplit[FuEPacketFragmentsTypemap],  // in this case same as the fragment's one, it can be empty object type so probe for that
  [FuEPacketAllResKeys]: FuComponentsTypemapsSplit[FuEPacketAllResKeys]; // fragment's keys or empty is never, @TODO isn't it cyclical?
}; // satisfies FuComponentsTypemapsSplit


export type FuResourceidsforOneFragment < // local from local, fq from fqed; Fqed ones go to nav map
  OneFragmentId_NameOrFq extends string,
  Feed extends FuFeedTypes,
  View extends FuViewTypes
> =
  keyof FuResLlTypemapforOneFragment<OneFragmentId_NameOrFq,Feed,View> & string
;

export type FuFeedResourceidLike = (FuResourceidsforOneFragment<string,FuFeedTypes,never> & string) extends infer Rid
  ? Rid extends `${infer ResourceKind}${FuEResourceidSeparators.AtKindlabel}${infer FragmentNameLocOrFq}` & string ?
    ResourceKind extends `${FuEResourcekindsKeys.Feed}` ? Rid : never
    : never : never
;

export type FuViewResourceidLike = FuResourceidsforOneFragment<string,never,FuViewTypes> & string extends infer Rid
  ? Rid extends `${infer ResourceKind}${FuEResourceidSeparators.AtKindlabel}${infer FragmentNameLocOrFq}` & string ?
    ResourceKind extends `${FuEResourcekindsKeys.View}` ? Rid : never
    : never : never
  ;


export type FuResKindPropsforShxTypemaps <  // non-kindlabeled, non-fqed (or can be fqed, Lr)
  FeedsShlTypemap extends Record<keyof FeedsShlTypemap & string,FuFeedTypes>,
  ViewsShlTypemap extends Record<keyof ViewsShlTypemap & string,FuViewTypes> = Record<Extract<keyof FeedsShlTypemap,string>,FuViewTypes>,
  SinglesTypemap extends FuSinglesTypemap_Assert = never
> =
  & { [FK in `${FuEResourcekindsKeys.Feed}s`]: FeedsShlTypemap }
  & { [VK in `${FuEResourcekindsKeys.View}s`]: ViewsShlTypemap }
  & (SinglesTypemap extends FuSinglesTypemap_Assert
    ?
    { [SK in `${FuEResourcekindsKeys.Single}s`]-?: SinglesTypemap }
    : unknown
  )
;

// Split

export type FuComponentsTypemapsSplit = {
  [FuEPacketSubspacesIdsUnion]: string,
  [FuEPacketFragmentsTypemap]: FuFragmentsTypemap_Assert |FeTEmptyObject,
  [FuEPacketSinglesTypemap]: FuSinglesTypemap_Assert |FeTEmptyObject,
  [FuEPacketAllResTypemap]: FuAllResTypemap_Assert |FeTEmptyObject,
  [FuEPacketAllResKeys]: string |never;  // string keys union
};
