/*

/// <reference path="types.ts" />
import type {
  _Fe_GConstructor,
} from 'fe3';
import { applyMixins, } from 'fe3/utils';
import {
  FeStatefulIdentity, FePersistenceGetLeaf
} from '../_shared/types.js';
import {
  FeStateful
} from './types.js';

declare namespace globalThis {
  var fePersistence: FePersistenceOutlet;
}

export const getGlobalFePersistence = ()=> globalThis.fePersistence;

export class Branch implements FeStateful.IBranch {

}

/!*export interface IFePersistenceStore {

}*!/

export function feStateful<T>(
  self: T,
  options: {}
) {
  return self;
}

export class FePersistenceOutlet  // @TODO WIP
{
  constructor(

  ) {
  }

  public getLeaf: FePersistenceGetLeaf = (
    self: {},
    identity?: FeStatefulIdentity,
  ) => {return {};};
}


export function ComposeFePersistenceOutletwithStore <
  TStoreClassAndOtherMergedInterfaces extends {} = {}, // @TODO store type
>(
  storeAndOtherMergedInterfaces?: {}[]
):
  _Fe_GConstructor<
    FePersistenceOutlet &
    TStoreClassAndOtherMergedInterfaces // @TODO what about the array of in-mixed classes
  >
{

  class BaseforDerivedswithStoreAndOthers
    extends FePersistenceOutlet
  {
    constructor() {
      super();
    }
  }
  // @ts-ignore
  interface BaseforDerivedswithStoreAndOthers extends TStoreClassAndOtherMergedInterfaces { }
  applyMixins(
    BaseforDerivedswithStoreAndOthers,
    storeAndOtherMergedInterfaces || []
  );
  return BaseforDerivedswithStoreAndOthers as unknown as _Fe_GConstructor<
    FePersistenceOutlet &
    TStoreClassAndOtherMergedInterfaces
  >;
}

*/
