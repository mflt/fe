import type {
  _ExtractTypesUnionfromIndexed, _UnionToIntersection,
} from 'fe3';
import type {
  FuEPacketSubspacesIdsUnion, FuEPacketFragmentsTypemap, FuEPacketSinglesTypemap, FuEPacketAllResTypemap,
  FuEPacketAllResKeys, FuEPacketComponentsRecord, FuEPacketFragmentsTs,
} from './strings.js';
import type { FuComponentsTypemapsSplit, } from './types.js';
import type {
  _TComponentsRecordwBase, FuFragmentsKeysofComponentsRec, FuFragmentLxTypemapofComponentsRec,
} from './record.types.js';
import type { FuResLlTypemaptoLx, } from './resource.types.js';
import type { _FuFragmentAny, } from '../fragment.js';
import type { _FuNavComponentsRecKeys, } from '../sub.js';


// Split by Typemaps Tuple

// export type $FuFragmentsTypemap = 0;  // FragmentsTypemap extends Record<keyof FragmentsTypemap & string, FuFeedTypes|FuViewTypes>
// export type $FuSinglesTypemap = 1;  // SinglesTypemap extends FuSinglesTypemap_Assert = never

export type FuComponentsTypemapsPacket =
  & FuComponentsTypemapsSplit
  & {
    [FuEPacketComponentsRecord]: _TComponentsRecordwBase,
    [FuEPacketFragmentsTs]: _FuFragmentAny[],
};


export type FuTypemapsPacket <
  ComponentsRecLrIdsStringsUnion extends string,  // same position but more likely is a merge of id-s
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> = FuComponentsTypemapsPacketofSub<ComponentsRecLrIdsStringsUnion,ComponentsR,FragmentsTs>;

export type FuComponentsTypemapsPacketofSub <
  ComponentsRecLrIdString extends string, // as in the name of the type there's Sub, we say one string here, however it can be a union for several Subs, see above
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> = {
  [FuEPacketSubspacesIdsUnion]: ComponentsRecLrIdString,
  [FuEPacketFragmentsTypemap]:
    FuFragmentLxTypemapofComponentsRec<ComponentsRecLrIdString, ComponentsR, FragmentsTs>,
  [FuEPacketSinglesTypemap]:
    FuResLlTypemaptoLx<
      ComponentsRecLrIdString,
      // @ts-ignore @TODO
      Omit<ComponentsR, _FuNavComponentsRecKeys | FuFragmentsKeysofComponentsRec<ComponentsR, FragmentsTs>>
    >
  ,
  [FuEPacketAllResTypemap]: // @TODO follow the below pattern with MergingStage1
    & FuFragmentLxTypemapofComponentsRec<ComponentsRecLrIdString, ComponentsR, FragmentsTs>
    & FuResLlTypemaptoLx<
        ComponentsRecLrIdString,
        // @ts-ignore @TODO
        Omit<ComponentsR, _FuNavComponentsRecKeys | FuFragmentsKeysofComponentsRec<ComponentsR, FragmentsTs>>
      >
  ,
  [FuEPacketAllResKeys]: Exclude<keyof ComponentsR, _FuNavComponentsRecKeys>,
  [FuEPacketComponentsRecord]: ComponentsR extends _TComponentsRecordwBase? ComponentsR: never,
  [FuEPacketFragmentsTs]: FragmentsTs,
}; // satisfies FuComponentsTypemapsPacket


export type FuComponentsTypemapsSplitofRec <
  ComponentsRecLrIdString extends string,
  ComponentsR extends _TComponentsRecordwBase<keyof ComponentsR & string>,
  FragmentsTs extends _FuFragmentAny[]
> =
  Pick<
    FuComponentsTypemapsPacketofSub<ComponentsRecLrIdString,ComponentsR,FragmentsTs>,
    FuEPacketSubspacesIdsUnion|FuEPacketFragmentsTypemap|FuEPacketSinglesTypemap|FuEPacketAllResTypemap|FuEPacketAllResKeys
  >
; // satisfies FuComponentsTypemapsSplit


export type FuTypemapsPacketsMerged < // @TODO must not merge correctly FragmentTs-es or maybe others too
  CompsTypemapsPackets extends
    | FuComponentsTypemapsPacket[]
    | FuComponentsTypemapsSplit[]
> = {
    [TuK in keyof FuComponentsTypemapsPacket]:
    _ExtractTypesUnionfromIndexed<{
      [AK in keyof CompsTypemapsPackets as number]:
      CompsTypemapsPackets[AK extends keyof CompsTypemapsPackets ? AK : never] extends infer Packet
      ? Packet extends FuComponentsTypemapsPacket ? Packet[TuK]
        : Packet extends FuComponentsTypemapsSplit ? Packet[TuK extends keyof FuComponentsTypemapsSplit? TuK : never]
        : never : never
    }>
    // extends infer Merged ? Merged extends typeof FuComponentsTypemapsPacketTuple[AK] ? Merged : never
  } extends infer PacketsDis ? {
    [FuEPacketSubspacesIdsUnion]: PacketsDis extends {[FuEPacketSubspacesIdsUnion]: unknown} ?
      PacketsDis[FuEPacketSubspacesIdsUnion][keyof PacketsDis[FuEPacketSubspacesIdsUnion]] : never,
    [FuEPacketFragmentsTypemap]: PacketsDis extends {[FuEPacketFragmentsTypemap]: unknown} ?
      _UnionToIntersection<PacketsDis[FuEPacketFragmentsTypemap][keyof PacketsDis[FuEPacketFragmentsTypemap]]> : never,
    [FuEPacketSinglesTypemap]: PacketsDis extends {[FuEPacketSinglesTypemap]: unknown} ?
      _UnionToIntersection<PacketsDis[FuEPacketSinglesTypemap][keyof PacketsDis[FuEPacketSinglesTypemap]]> : never,
    // FuEPacketComponentsRecord  // @TODO
    // FuEPacketFragmentsTs
  } extends infer MergingStage1 ? (
    & MergingStage1
    & {
      [FuEPacketAllResTypemap]:
        & MergingStage1[FuEPacketFragmentsTypemap extends keyof MergingStage1? FuEPacketFragmentsTypemap : never]
        & MergingStage1[FuEPacketSinglesTypemap extends keyof MergingStage1? FuEPacketSinglesTypemap : never],
    }
  ) extends infer MergingStage2 ? (
    & MergingStage2
    & {
      [FuEPacketAllResKeys]: (
        | keyof MergingStage1[FuEPacketFragmentsTypemap extends keyof MergingStage1? FuEPacketFragmentsTypemap : never]
        | keyof MergingStage1[FuEPacketSinglesTypemap extends keyof MergingStage1? FuEPacketSinglesTypemap : never]
        ) & string,
    }
  ) extends infer MergingStage3 ?
  MergingStage3 extends FuComponentsTypemapsPacket ? MergingStage3 :
  MergingStage3 extends FuComponentsTypemapsSplit ? MergingStage3 : never
  : never : never : never : never
;

// move this somewhere @TODO may work fine wo exclude, https://github.com/microsoft/TypeScript/issues/27995
