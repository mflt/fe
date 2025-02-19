import {
  _feIsAsyncFunction, FePromisewithResolvers
} from 'fe3';
import { FuNavNodeHeader } from './header.js';
import { FuNavBaseInit } from './_node.js';


export type FuNavUnitInitJob = (()=> boolean|void) | (()=> Promise<boolean|void>);
export type FuNavUnitInitJobOnError = (err: Error) => void;   // @TODO ErrorT

export type FuNavInitFeeds = {
  prepareFeeds?: FuNavUnitInitJob,
  onPrepareError?: FuNavUnitInitJobOnError,
};

export type _FuNavUnit_StateHelpers = {
  awaitOnFeedsReady: ()=> Promise<boolean>,
  resolveFeedsReady: ()=> void,
  rejectFeedsReady: (err: Error)=> void,
  awaitOnViewsDidInflate: ()=> Promise<boolean>,
  resolveViewsDidInflate: ()=> void,
  rejectViewsDidInflate: (err: Error)=> void,
  awaitOnSwitchingtoViewsComplete: ()=> Promise<boolean>,
  resolveSwitchingtoViewsComplete: ()=> void,
  rejectSwitchingtoViewsComplete: (err: Error)=> void,
}

export type _FuNavUnit_ActionsRecord = Record<string, Function | (() => Promise<unknown>)>; // @TODO may define async function better see fe3


export class FuNavUnitBase <
  UValidNodeLrIdString extends string
>
  extends FuNavNodeHeader<UValidNodeLrIdString>
{
  #getThis!: FuNavBaseInit<UValidNodeLrIdString>['getThis']|undefined;
  get getThis () { return this.#getThis; }
  set getThis (that) { this.#getThis = that; }

  public actions = {} as _FuNavUnit_ActionsRecord;

  #ownFeedsReady = new FePromisewithResolvers<boolean>();
  public get onFeedsReady () { return this.#ownFeedsReady; }

  #ownViewsDidInflate = new FePromisewithResolvers<boolean>();
  public get onViewsDidInflate () { return this.#ownViewsDidInflate; }

  #switchingtoOwnViewsComplete = new FePromisewithResolvers<boolean>();
  public get onSwitchingtoViewsComplete () { return this.#switchingtoOwnViewsComplete; }

  constructor () { super(); }

  public async _starterRunner (
    starterJob: FuNavUnitInitJob,
    onError?: FuNavUnitInitJobOnError,
  ) {
    try {
      let res: boolean|void;
      if (_feIsAsyncFunction(starterJob)) {
        res = await starterJob();
      } else {
        res = starterJob?.();
      }
      if (res === true || res === void 0) {
        return true;
      }
      throw new Error('bad run', {cause: res}); // @TODO
    } catch (err) {
      onError && onError(err as Error);
      return err as Error;
    }
  }

  public async prepareFeeds (  // does not throw
    prepareFeedsJob: FuNavUnitInitJob,
    onError?: FuNavUnitInitJobOnError,
  ) {
    try {
      const res = await this._starterRunner(prepareFeedsJob,onError);
      if (res === true || res === void 0) {
        this.onFeedsReady.resolve(true);
        return true;
      }
      throw res;
    } catch (err) {
      this.onFeedsReady.reject(err as Error);
      return err as Error;
    }
  }

  public async inflateViews (  // does not throw
    inflateViewsJob: FuNavUnitInitJob,
    onError?: FuNavUnitInitJobOnError,
  ) {
    try {
      const res = await this._starterRunner(inflateViewsJob,onError);
      if (res === true || res === void 0) {
        this.onViewsDidInflate.resolve(true);
        return true;
      }
      throw res;
    } catch (err) {
      this.onViewsDidInflate.reject(err as Error);
      return err as Error;
    }
  }

}
