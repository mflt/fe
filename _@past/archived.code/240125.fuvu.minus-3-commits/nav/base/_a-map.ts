import type { FuETypesPacket, } from '../_shared/strings.js';
import type {
  FuFeedTypes, FuSingleTypes, FuViewTypes, FuComponentsTypemapsSplit,
} from '../_shared/types.js';
import type {
  FuComponentsTypemapsPacket,
} from '../_shared/packet.types.js';


export abstract class _FuAnchorMap <  // Map overrider, fqed (long-right) resource id-s are assumed but can work with local ones in a singular case
  TypemapsPacket extends 
    | FuComponentsTypemapsPacket
    | FuComponentsTypemapsSplit
>
  extends Map<
    TypemapsPacket[FuETypesPacket.AllResKeys],
    | FuFeedTypes|FuViewTypes
    | FuSingleTypes
  >
{

  protected constructor() {
    super();
  }

  // RID -- fully qualified (all long) resource id assumed

  override get <
    RID extends TypemapsPacket[FuETypesPacket.AllResKeys]
      = TypemapsPacket[FuETypesPacket.AllResKeys],
  > (
    key: RID
  )
  {
    return super.get(
      key
    ) as (
      RID extends keyof TypemapsPacket[FuETypesPacket.FragmentsTypemap]
        ? TypemapsPacket[FuETypesPacket.FragmentsTypemap][RID]
        : RID extends keyof TypemapsPacket[FuETypesPacket.SinglesTypemap]
          ? TypemapsPacket[FuETypesPacket.SinglesTypemap][RID]
          : never
      )|undefined;
  }

  override set <
    RID extends TypemapsPacket[FuETypesPacket.AllResKeys]
      = TypemapsPacket[FuETypesPacket.AllResKeys],
    T extends
      RID extends keyof TypemapsPacket[FuETypesPacket.FragmentsTypemap]
        ? TypemapsPacket[FuETypesPacket.FragmentsTypemap][RID]
        : RID extends keyof TypemapsPacket[FuETypesPacket.SinglesTypemap]
          ? TypemapsPacket[FuETypesPacket.SinglesTypemap][RID]
          : never
      = RID extends keyof TypemapsPacket[FuETypesPacket.FragmentsTypemap]
      ? TypemapsPacket[FuETypesPacket.FragmentsTypemap][RID]
      : RID extends keyof TypemapsPacket[FuETypesPacket.SinglesTypemap]
        ? TypemapsPacket[FuETypesPacket.SinglesTypemap][RID]
        : never
  > (
    key: RID,
    value: T
  ) {
    return super.set(key,value); // @TODO review return type
  }

  // @TODO other map members
}
