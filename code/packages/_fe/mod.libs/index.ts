export type * from './core-types/root.types.js';
export * from './promises/promises.js';
export * from './probes/probes.js';
export * from './collections/collections.js';
export * from './collections/ponyfillIterableonKeyedObject.js';
export type * from './core-types/constructor.types.js';
export * from './helpers/collections.js';
export * from './helpers/constructor.js';
export * from './helpers/delay.js';
export type * from './core-types/helper.types.js';
export type * from './core-types/value.i-f.js';

import _feProbes from './probes/probes.js';
import _feCollections from './collections/collections.js';
import _feIterables from './collections/ponyfillIterableonKeyedObject.js';

export const _fe: 
  & typeof _feProbes 
  // this whole typing overhead is necessiated by TS2775
  & typeof _feCollections 
  & typeof _feIterables = {
  ..._feProbes,
  ..._feCollections,
  ..._feIterables,
}
