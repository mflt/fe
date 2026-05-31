import {
  FuEAnchorNodeKey, $fu,
} from './_shared/strings.js';
import type {
  FuFeedTypes, FuViewTypes, FuSingleTypes,
  FuTypemapSplitforOneSingle, FuTypemapSplitforOneFragment, FuComponentsTypemapsSplit,
} from './_shared/types.js';
import type { FuComponentsTypemapsPacket, } from './_shared/packet.types.js';
import { _FuAnchorMap, } from './base/_a-map.js';
import type { FuNavInitFeeds, } from './base/unit.js';
import type { FuNavBaseInit, } from './base/_node.js';
import { FuNavSpace, } from './space.js';


export type FuAnchorInit = FuNavInitFeeds & Omit<FuNavBaseInit<FuEAnchorNodeKey>,'id'>;

export class FuSpacesMap <
  SpacesKeyStrings extends string,  // @TODO define as string literal union
  // FragmentsTypemap extends Record<
  //   keyof FragmentsTypemap & string,
  //   FuFeedTypes|FuViewTypes
  // >,
  // SinglesTypemap extends FuSinglesTypemap_Assert = never
>
  extends Map<
      SpacesKeyStrings,
      FuNavSpace<SpacesKeyStrings,string> // @TODO
  >
{}


export class FuAnchor <
  AllSpacesTypemapsPacket extends
    | FuComponentsTypemapsPacket
    | FuComponentsTypemapsSplit
>
  extends _FuAnchorMap<AllSpacesTypemapsPacket>
{
  public [$fu] = {
    spaces: new FuSpacesMap(),  // @TODO spaces strings as type
  }

  /*public fragmentsParents = new Map<
    FuComponentsIdsfromTypemapsDuo<
      AllSpacesTypemapsPacket[FuETypesPacket.FragmentsTypemap],
      AllSpacesTypemapsPacket[FuETypesPacket.SinglesTypemap]>,
    HTMLElement
  >(); // @TODO*/

  constructor(
    init?: FuAnchorInit,
  ) {
    super();
    /*super({
      key: FuEAnchorNodeKey,
      ...init
    });*/
  }


}


export abstract class FuAnchorfromOneFragmentPerspective <
  Feed extends FuFeedTypes,
  View extends FuViewTypes
>
  extends FuAnchor<FuTypemapSplitforOneFragment<string,Feed,View>>  // context-less type for fragment init
{}

export abstract class FuAnchorAny
  extends FuAnchor<FuTypemapSplitforOneSingle<string,FuSingleTypes>>  // context-less type
{}
