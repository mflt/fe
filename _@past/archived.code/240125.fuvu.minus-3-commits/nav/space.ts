import {
  _feIsObject, FePromisewithResolvers,
} from 'fe3';
import type { FeElLocation } from 'fevmi';
import { $fu, } from './_shared/strings.js';
// import type {  } from './_shared/types.js';
import { fuToViewLocation, } from './_shared/helpers.js';
import type { FuAnyComponent, } from './fragment.js';
import { FuNavNodeHeader, } from './base/header.js';
import type { FuNavBaseInit, } from './base/_node.js';
import type { FuNavSub, } from './sub.js';
import type { FuAnchorAny, } from './anchor.js';
import {
  type FuNavModuleLoadersMapInit,
  FuNavModuleLoadersMap,
} from './modules.js';


export type FuNavSpaceInit <
  UValidNodeLrIdString extends string,
  UValidSubspacesKeyStringsUnion extends string,
> =
  & {
    initialLocationOrSelector?: Parameters<typeof fuToViewLocation>[0],
    subs?: Array<[UValidSubspacesKeyStringsUnion, FuNavSub<UValidSubspacesKeyStringsUnion>]>, // already instantiated subs/nodes
    subsModuleLoaders?: FuNavModuleLoadersMapInit<UValidSubspacesKeyStringsUnion>,
    buffer?: DocumentFragment,
  }
  & Exclude<FuNavBaseInit<UValidNodeLrIdString>,'spaceId'>
;

// export type SwitchingCompletePromise <UValidSubspacesKeyStringsUnion extends string> = Promise<UValidSubspacesKeyStringsUnion|false>;


export class FuNavSpace <
  UValidNodeLrIdString extends string,
  UValidSubspacesKeyStringsUnion extends string,
>
  extends FuNavNodeHeader<UValidNodeLrIdString> // as opposed to subspaces and base it has header as super
{

  #keyofActiveSub = undefined as UValidSubspacesKeyStringsUnion|undefined; // ComponentRecord is Sub
  get keyofActiveSub () { return this.#keyofActiveSub }
  set keyofActiveSub (
    subKey: UValidSubspacesKeyStringsUnion|undefined, // @TODO >? _ModulesKeyStrings|undefined,
  ) {
    this.#keyofActiveSub = subKey;
    // @TODO
  }

  #switchingComplete = new FePromisewithResolvers<UValidSubspacesKeyStringsUnion|false>();  // @TODO false?
  public get onSwitchingComplete () { return this.#switchingComplete; }
  public resolveSwitchingComplete (
    subKey: UValidSubspacesKeyStringsUnion,
  ) { this.#switchingComplete.resolve(subKey); }
  public rejectSwitchingComplete (err: Error) { this.#switchingComplete.reject(err); }
  public awaitOnSwitchingComplete = ()=> (async ()=> await this.onSwitchingComplete)();

  subs!: Map<UValidSubspacesKeyStringsUnion, FuNavSub<UValidSubspacesKeyStringsUnion>>;

  buffer: FuNavSpaceInit<UValidNodeLrIdString,UValidSubspacesKeyStringsUnion>['buffer'];

  // parentsLocations = new Map<string,FeElLocation>();  // @TODO
  parentsMap = new WeakMap<FuAnyComponent,HTMLElement>(); // does not rely on that if this can be stored in the component

  history = [] as UValidSubspacesKeyStringsUnion[]; // @TODO

  subsModuleLoaders!: FuNavModuleLoadersMap<UValidSubspacesKeyStringsUnion>;

  constructor(  // similar pattern to Fragment and also with an init element which is a pattern in subspace
    spaceName: UValidNodeLrIdString, // @TODO or? string,
    private a: FuAnchorAny, // @TODO typing
    init?: FuNavSpaceInit<UValidNodeLrIdString,UValidSubspacesKeyStringsUnion>,
  ) {
    super();
    this.id = spaceName;
    // @TODO if not defined
    this.subs = new Map<UValidSubspacesKeyStringsUnion, FuNavSub<UValidSubspacesKeyStringsUnion>>(init?.subs);
    this.subsModuleLoaders = new FuNavModuleLoadersMap<UValidSubspacesKeyStringsUnion>(init?.subsModuleLoaders);
    if (init!==undefined) {
      this.buffer = init.buffer || document.createDocumentFragment(); // @TODO if default buildup is this and having a segment in case of each module is not an overkill
    } else {

    }
  }

  async toParent (
    component: FuAnyComponent,
    parent?: HTMLElement,
  ): Promise<boolean> {
    if (parent) {
      this.parentsMap.set(component,parent);
    }
    const _parent = this.parentsMap.get(el);
    if (_feIsObject(_parent)) {
      this.buffer?.removeChild(el);
      const res = _parent.appendChild(el);
      return !!res;
    } else {
      return false;
    }
  }

  async toBuffer (
    el: HTMLElement,
  ): Promise<boolean> {
    const _parent = this.parentsMap.get(el) || el.parentElement;
    if (_feIsObject(_parent)) {
      _parent.removeChild(el);
    }
    if (_feIsObject(this.buffer)) {
      const res = this.buffer.appendChild(el);
      return !!res;
    } else {
      return false;
    }
  }


  async switchtoOwnViews (

  ) {

  }

  async switchActiveSub (
    subKey: typeof this.keyofActiveSub,
  ): SwitchingCompletePromise<UValidSubspacesKeyStringsUnion> // _ModulesKeyStrings>
  {
    if (!subKey) {
      // @TODO log, wrong param
      return false;
    }

    // maybe if (this.switchingComplete)
    // @TODO implement interrupting the in progress switching (redirect it to buffer) and start a new one

    this.switchingComplete = (async ()=> {

      let subspacetoCome = this.subs.get(subKey);
      if (!subspacetoCome) {
        try {
          if (!await this.readySub(subKey)) {  // isActive is set to non undefined
            throw new Error('failed to load sub'); // @TODO
          }
        } catch (e) {
          console.error('[modules] Could not switch.',e);  // @TODO
          return false;
        }
        subspacetoCome = this.subs.get(subKey);
      }

      if (_feIsObject(subspacetoCome) && subKey === this.keyofActiveSub && subspacetoCome[$fu].isActive) {  // we already in the requested sub
        // @TODO log
        return true;
      }

      /*// Test parent dom nodes:
      if (!nav.a?.rollWrapper) {
        console.error('[travel-depo] Slot for the main roll is not ready. Which is likely a fatal failure.');
        return false;
      }*/

      const subspacetoGo = this.keyofActiveSub ? this.subs.get(this.keyofActiveSub) : null;
      // Move current module's ui to the buffer:
      if (!!this.keyofActiveSub && _feIsObject(subspacetoGo)) {
        this.toBuffer()
        this.history.push(this.keyofActiveSub);
        subspacetoGo[$fu].isActive = false;
      }

      // Roll part:
      a.rollWrapper?.appendChild(modules[moduleKey]!.views.roll!);

      this.keyofActiveSub = moduleKey;
      subspacetoCome![$fu].isActive = true;
      return moduleKey;
    })();

    return this.switchingComplete;
  }

  async releaseModule () {
    //
  }



  async readySub (  // like, get it ready
    // 'ready' means we wait for the sub object to finish its super (standard/library) constructor,
    // and fire subInitReady as true
    // any custom constructor proceedings won't count
    // any additional readiness should be monitored otherwise, like that of the feeds or views
    // it works with baked in imported and dynamically imported subs
    subKey: typeof this.keyofActiveSub,
  ): Promise<boolean>
  {
    if (!subKey) {
      // @TODO log, wrong param
      return false;
    }
    try {
      // in the majority of cases (when switching) the first probe has to resolve positively and we return
      if (!!this.subs.get(subKey)) {  // @TODO should work with
        // the subs was a baked in import or we called into an already loading dyn sub
        return await this.subs.get(subKey)!.subInitReady;  // the short successful resolution
      }

      // dyn sub's loading from module:

      if (!this.subsModuleLoaders?.get(subKey)) { // @TODO _feIsString
        // @TODO log the dyn sub was not loading and there's no loader associated
        throw new Error('no loader');
      }
      const module = await this.subsModuleLoaders?.get(subKey)?.(); // @TODO concurrent imports (race) of the same module are not handled
      // calls the corresponding import (FuNavModuleLoader) function which is expected to return a module of FuNavNodeModule shape
      if (module?.i) {
        await (module.i as FuNavSub<string>).onSubInitReady;  // awaits the tiny processing that may have already happened during bootstrapping the module, maybe not
        // the result of bootstrapping up to the initReady point is that sub registered itself in space
        if(!this.subs.get(subKey)) {
          // @TODO log the sub did not register in the space
          throw new Error('bad sub');
        }
        this.subs.get(subKey)![$fu].module = module;  // just for the record, no use in this data
      } else {
        // @TODO log bad module
        throw new Error('bad module');
      }

      return true;  // all controls successfully passed

    } catch (e) {
      // @TODO log
      return false;
    }
  }

}