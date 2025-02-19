
// General:

export enum FuEStrings {
  Undefined = 'undefined',
  NothingHere = 'nothing here',
}
export type FuEUndefinedString = FuEStrings.Undefined;
export const FuEUndefinedString = FuEStrings.Undefined;
export type FuENothingHereString = FuEStrings.Undefined;
export const FuENothingHereString = FuEStrings.Undefined;

// Base:

export const $fu = Symbol.for('@fuHelpersProps');
export const $state = Symbol.for('@fuStateProp');
export const $actions = Symbol.for('@fuActionsProp');

// Resource:

export enum FuEResourcekindsKeys {
  Feed = 'feed',
  View = 'view',
  // Action = 'func',
  Single = 'sngl',  // @TODO
}
export type FuResourcekindsKeyStrings = `${FuEResourcekindsKeys}`;
export type FuEFeedKey = FuEResourcekindsKeys.Feed;
export const FuEFeedKey = FuEResourcekindsKeys.Feed;
export type FuEViewKey = FuEResourcekindsKeys.View;
export const FuEViewKey = FuEResourcekindsKeys.View;
export type FuESingleKey = FuEResourcekindsKeys.Single;
export const FuESingleKey = FuEResourcekindsKeys.Single;

// Top:

export enum FuENavTopNodesKeys {
  Anchor = 'root',
  Main = 'main',
}
export type FuEAnchorNodeKey = FuENavTopNodesKeys.Anchor;
export const FuEAnchorNodeKey = FuENavTopNodesKeys.Anchor;
export type FuEMainNodeKey = FuENavTopNodesKeys.Main;
export const FuEMainNodeKey = FuENavTopNodesKeys.Main;

// Subspace (which assumed to be a dynamically imported module by default):

export enum FuNavNodeStatusStrings {  // @TODO obsolete!
  Undefined = FuEUndefinedString,
  Instantiated = 'instantiated',
  Starting = 'starting',
}

// Separators:

export enum FuEResourceidSeparators { // Rid - resource id
  // as seen from the next (to right) part of the long id
  AtSubspace = '/', // like /main or /travel.insurance
  AtKindlabel = '@',  // like feed@, view@, func@, bag@
  AtSpaceprefix = '.',  // the dot in travel.insurance, where travel is the space id and insurance is the sub's name
}
export type FuEAtSubspaceSeparator = FuEResourceidSeparators.AtSubspace;
export const FuEAtSubspaceSeparator = FuEResourceidSeparators.AtSubspace;
export type FuEAtKindlabelSeparator = FuEResourceidSeparators.AtKindlabel;
export const FuEAtKindlabelSeparator = FuEResourceidSeparators.AtKindlabel;
export type FuEAtSpaceprefixSeparator = FuEResourceidSeparators.AtSpaceprefix;
export const FuEAtSpaceprefixSeparator = FuEResourceidSeparators.AtSpaceprefix;

// Packet:

export enum FuETypesPacket {
  SubspacesIdsUnion = 'subspaces-ids', // one or more if merged
  FragmentsTypemap = 'fragments-typemap',  // FragmentsTypemap extends Record<keyof FragmentsTypemap & string, FuFeedTypes|FuViewTypes>
  SinglesTypemap = 'singles-typemap',
  AllResTypemap = 'all-resources-typemap',
  AllResKeys = 'all-resources-keys',
  ComponentsRecord = 'components-record',
  FragmentsTs = 'fragments-ts',
}

export type FuEPacketSubspacesIdsUnion = FuETypesPacket.SubspacesIdsUnion;
export const FuEPacketSubspacesIdsUnion = FuETypesPacket.SubspacesIdsUnion;
export type FuEPacketFragmentsTypemap = FuETypesPacket.FragmentsTypemap;
export const FuEPacketFragmentsTypemap = FuETypesPacket.FragmentsTypemap;
export type FuEPacketSinglesTypemap = FuETypesPacket.SinglesTypemap;
export const FuEPacketSinglesTypemap = FuETypesPacket.SinglesTypemap;
export type FuEPacketAllResTypemap = FuETypesPacket.AllResTypemap;
export const FuEPacketAllResTypemap = FuETypesPacket.AllResTypemap;
export type FuEPacketAllResKeys = FuETypesPacket.AllResKeys;
export const FuEPacketAllResKeys = FuETypesPacket.AllResKeys;
export type FuEPacketComponentsRecord = FuETypesPacket.ComponentsRecord;
export const FuEPacketComponentsRecord = FuETypesPacket.ComponentsRecord;
export type FuEPacketFragmentsTs = FuETypesPacket.FragmentsTs;
export const FuEPacketFragmentsTs = FuETypesPacket.FragmentsTs;
// export type FuEPacket XOX = FuETypesPacket. XOX;
// export const FuEPacket XOX = FuETypesPacket. XOX;