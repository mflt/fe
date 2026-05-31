import {
  $fu, $state, $actions, FuEAtSpaceprefixSeparator,
} from '../_shared/strings.js';
import {
  fuEmptyNodeHeader, type _FuNavNodeHeader,
} from './header.js';
import {
  FuNavUnitBase, type _FuNavUnit_StateHelpers,
} from './unit.js';


// Nav modules are in cascade. Where the lower ones can import the higher ones, but higher ones only load lower ones
// dynamically so on demand. Import only downstream types.
// Main nav module is exception, it has a similar structure logically but not in details. @TODO
// The nav of spaces is also an exception as it is loaded anyway. But that also means no bootstrapping imports of
// lower nav modules or other optional ("nav-time") entities.


export type FuNavBaseInit <
  UValidNodeLrIdString extends string
> = {
  id: UValidNodeLrIdString, // if spaceId is present then this is considered a name of base/componentrec/subspace
  spaceId?: string,  // @TODO type
  getThis?: ()=> FuNavNodeBase<UValidNodeLrIdString>,  // forces the user code to provide downstream not available in super
};


export abstract class FuNavNodeBase < // this operates over a set of Fragments and Single types
  UValidNodeLrIdString extends string,
>
{
  public [$fu] = new FuNavUnitBase<UValidNodeLrIdString>();

  public get [$state] () {
    // actually state-state is in [$fe], this one is about code user api functions related to state
    // it also returns this + the functions
    return {
      ...this,
      ...{
        awaitOnFeedsReady: ()=> (async ()=> await this[$fu].onFeedsReady)(),  // synchronous!, use the [$fu] getter if async original is needed
        resolveFeedsReady: ()=> { this[$fu].onFeedsReady.resolve(true); },
        rejectFeedsReady: (err: Error)=> { this[$fu].onFeedsReady.reject(err); }, // @TODO specify ErrorT
        awaitOnViewsDidInflate: ()=> (async ()=> await this[$fu].onViewsDidInflate)(),  // synchronous!
        resolveViewsDidInflate: ()=> { this[$fu].onViewsDidInflate.resolve(true); },
        rejectViewsDidInflate: (err: Error)=> { this[$fu].onViewsDidInflate.reject(err); },
        awaitOnSwitchingtoViewsComplete: ()=> (async ()=> await this[$fu].onSwitchingtoViewsComplete)(),  // synchronous!
        resolveSwitchingtoViewsComplete: ()=> { this[$fu].onSwitchingtoViewsComplete.resolve(true); },
        rejectSwitchingtoViewsComplete: (err: Error)=> { this[$fu].onSwitchingtoViewsComplete.reject(err); },
      } satisfies _FuNavUnit_StateHelpers,
  }}

  public get [$actions] () {
    return {
      //
      ...this[$fu].actions,
  }}
  protected set [$actions] (actions) { this[$fu].actions = actions; }

  protected constructor(
    init: FuNavBaseInit<UValidNodeLrIdString>,
  ) {
    this[$fu].id = ( init?.id // the id should be in fq form in case of subs (prepended with a space id)
      ? init?.spaceId
        ? init.spaceId + FuEAtSpaceprefixSeparator + init.id  // id is considered a name in this case to be extended
        : init.id
      : fuEmptyNodeHeader.header.id
    ) as _FuNavNodeHeader<UValidNodeLrIdString>['id']; // @TODO
    this[$fu].getThis = init?.getThis;
    // initialization at FuNavNodeBase constructor phase should be quick, up to the downstream point of sub registering itself in its parent space
    // this.head.status = FuNavNodeStatusStrings.Starting; // early instantiating status
  }

}
