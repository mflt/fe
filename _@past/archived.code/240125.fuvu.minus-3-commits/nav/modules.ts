import type { FuFeedTypes, FuViewTypes, } from './_shared/types.js';
import type {
  _FuNavUnit_StateHelpers, _FuNavUnit_ActionsRecord,
} from './base/unit.js';
import type { FuNavNodeBase, } from './base/_node.js';
import { FuFragment, } from './fragment.js';


// NavNode module

export type FuNavNodeModule <
  NavNode extends FuNavNodeBase<string> = FuNavNodeBase<string>,
  ActionsRecord extends _FuNavUnit_ActionsRecord = _FuNavUnit_ActionsRecord,
  // TValidNodesKeys extends string,
> = { // the standard entries of a nav/node module
  i: NavNode,
  s?: NavNode & _FuNavUnit_StateHelpers,
  a?: ActionsRecord;
}

export type FuNavModuleLoader = ()=> Promise<FuNavNodeModule>;
export type FuNavModuleLoadersMapInit<
  UValidNodesKeyStringsUnion extends string
> = [
  UValidNodesKeyStringsUnion,
  FuNavModuleLoader,
][];

export class FuNavModuleLoadersMap <
  UValidNodesKeyStringsUnion extends string
>
  extends Map<UValidNodesKeyStringsUnion,FuNavModuleLoader>
{
  constructor (
    loadersMapInit?: FuNavModuleLoadersMapInit<UValidNodesKeyStringsUnion>
  ) {
    super(loadersMapInit);
  }
}

// Fragment module

export declare module FragmentModule {
  export class Fragment extends FuFragment<FuFeedTypes,FuViewTypes> {}
  export class Feed {}
  export class View {}  // @TODO
}
