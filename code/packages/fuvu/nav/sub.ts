import {
  type _ExtractTypesfromRecord, type _TKeyofRecordT,
  _feIsFunction, _feIsObject,
} from 'fe3';
import {
  $fu, $actions, $state,
} from './_shared/strings.js';
import type {
  FuSingleTypes, FuComponentsUnitProps_nonMangledKey, FuViewLocation,
} from './_shared/types.js';
import type { FuShapeofComponentsRec, _TComponentsonlyRecord, } from './_shared/record.types.js';
import {
  fuComponentIdfromName, fuHasUnitField, fuAssignUnitField, fuToViewLocation,
} from './_shared/helpers.js';
import {
  FuNavUnitBase, type FuNavInitFeeds,
} from './base/unit.js';
import {
  FuNavNodeBase, type FuNavBaseInit,
} from './base/_node.js';
import {
  _FuFragmentAny, FuAnyComponent,
} from './fragment.js';
import { fuIsFragment, } from './_shared/probes.js';
import type { FuNavSpace } from './space.js';
import type { FuAnchorAny, } from './anchor.js';


// ComponentRecord aka Sub/subspace from a space's pov
// Sub's 1st level shape is ComponentRecord but internals deal with nav stuff


export type FuNavComponentsRecordInit < // Sub w/o parent space
  ComponentsRecordLrIdString extends string
> =
  & {
    // sub loaded by the anchor node directly (not via space) is ok, like in case of the main sub
  }
  & FuNavBaseInit<ComponentsRecordLrIdString>
  & FuNavInitFeeds
;

export type FuNavSubInit <
  ComponentsRecordLrIdString extends string
> =
  & {
    // sub loaded by the anchor node directly is ok, like in case of the main sub
    // specifying its props is the responsibility of space
    getThis: ()=> FuNavNodeBase<ComponentsRecordLrIdString>,  // forces the user code to provide downstream not available in super
    space: FuNavSpace<string, string>,  // @TODO
    a: FuAnchorAny, // @TODO, allows for avoiding type errors with a.set
  }
  & FuNavComponentsRecordInit<ComponentsRecordLrIdString>
;


export class FuNavComponentsRecord <
  ComponentsRecordLrIdString extends string,  // not a union of valid strings but the only string applicable which is used in constructing long right Rid-s
>
  extends FuNavNodeBase<ComponentsRecordLrIdString>
{
  constructor(
    init: FuNavComponentsRecordInit<ComponentsRecordLrIdString>,
  ) {
    super(init);
    if (!!init?.prepareFeeds) {
      this[$fu].prepareFeeds(init.prepareFeeds, init.onPrepareError);
      this[$state].awaitOnFeedsReady();
    }
  }

}

export type FuComponentinSubDecoratorOptions <
  ComponentT extends FuAnyComponent = FuAnyComponent  // not used yet
> = {
  'non-mangled-key'?: FuComponentsUnitProps_nonMangledKey, // @TODO
  parent?: FuViewLocation|FuViewLocation['selectortoQuery'], // initial parent actually
  isFragment?: boolean, // unused
}

export function component < // prop decorator, adding parent discovery and non-mangled-key (an edge need for persistence in a rare case of forced mangling object props names)
  ComponentT extends FuAnyComponent = FuAnyComponent  // will be useful with the real decorators
> (
  options?: FuComponentinSubDecoratorOptions<ComponentT>,
  // context?: ClassFieldDecoratorContext,  https://github.com/tc39/proposal-decorators
) {
  // if (context?.kind==='field') {
    return function (
      sub: FuNavSub<string>,  // AnySub
      // component: ComponentT,
      componentKey: Exclude<_TKeyofRecordT,number>,  // old 'experimental' way, aka propertyKey
    ) {
      const component = (sub as unknown as Record<string|symbol,FuAnyComponent>)?.[componentKey];
      if (_feIsObject(component)) {  // @TOD check also if frozen, etc

        fuAssignUnitField(component);

        if (fuHasUnitField(component)) {
          component[$fu] = {
            ...component[$fu],
            nonMangledKey: options?.['non-mangled-key'] || component[$fu].nonMangledKey, // @TODO consider not adding the field at all
            location: options && ('parent' satisfies keyof FuComponentinSubDecoratorOptions) in options
              ? fuToViewLocation(options?.parent)
              : component[$fu].location,
          };
        }
        // return // component as ComponentT;
      } else {
        // log @TODO
        return; // component as ComponentT;
      }

    }
  // } else {
  //   // @TODO log decorator applied to an improper kind
  //   // is to throw acc to the spec
  //   return (component: ComponentT)=> component as ComponentT;
  // }

}

export function single <
  ComponentT extends FuSingleTypes = FuSingleTypes
> (
  options?: FuComponentinSubDecoratorOptions<ComponentT>,
) {
  return component(options);
}

export function fragment <
  ComponentT extends _FuFragmentAny = _FuFragmentAny
> (
  options?: FuComponentinSubDecoratorOptions<ComponentT>,
) {
  return component({
    isFragment: true,
    ...options,
  }); // @TODO add prepareFeed if not delayed, or to the constructor instead
}


export class FuNavSub <  // FuNavComponentsRecord
  ComponentsRecordLrIdString extends string,  // not a union of valid strings but the only string applicable which is used in constructing long right Rid-s
>
  extends FuNavComponentsRecord<ComponentsRecordLrIdString>
{

  public override [$fu] = new class <ComponentsRecordLrIdString extends string>
    extends FuNavUnitBase<ComponentsRecordLrIdString>
  {
    override get getThis () {
      return super.getThis as FuNavSubInit<ComponentsRecordLrIdString>["getThis"];
    }

    public get subspaceId () { return super.id; } // assumed to be fq (prepended with space id, see base's init)

    #space!: FuNavSubInit<ComponentsRecordLrIdString>['space'];
    get space () { return this.#space; }
    set space (space) { this.#space = space; }

    #a!: FuAnchorAny; // @TODO, allows for avoiding type errors with a.set
    get a () { return this.#a; }
    set a (a) { this.#a = a; }

    constructor(){  //  Not of the FuNavSub but it's $fu
      super();
    }

    forEachComponent <
      TSub extends FuNavSub<ComponentsRecordLrIdString>,
      cbArgs extends unknown[] = any[]
    > (
      cb: (
        component: FuAnyComponent,
        args?: cbArgs,
      )=> void,
      ...args: cbArgs
    ) {
      if (!_feIsFunction(cb)) {
        return false;
      }
      const componentsRecord = this.getThis?.() as unknown as FuShapeofComponentsRec<
        // @ts-ignore @TODO
        Exclude<TSub,_FuNavComponentsRecKeys>
      >;
      const componentsKeys = Object.keys(componentsRecord); // @TODO
      for (const key of componentsKeys) {
        cb(
          componentsRecord[key as keyof typeof componentsRecord] as unknown as FuAnyComponent,
          args,
        );
      }
    }

    forEachFragment <
      TSub extends FuNavSub<ComponentsRecordLrIdString>,
      cbArgs extends unknown[] = any[]
    > (
      cb: (
        component: _FuFragmentAny,
        args?: cbArgs,
      )=> void,
      ...args: cbArgs
    ) {
      if (!_feIsFunction(cb)) {
        return;
      }
      const _cb = (component: Parameters<typeof cb>[0], _args: cbArgs)=> {
        if (fuIsFragment(component)) {
          return cb(component,_args);
        }
      }
      return this.forEachComponent(_cb as Parameters<typeof this.forEachComponent>[0],args);
    }

    forEachSingle <
      TSub extends FuNavSub<ComponentsRecordLrIdString>,
      cbArgs extends unknown[] = any[]
    > (
      cb: (
        component: FuSingleTypes,
        args?: cbArgs,
      )=> void,
      ...args: cbArgs
    ) {
      if (!_feIsFunction(cb)) {
        return;
      }
      const _cb = (component: Parameters<typeof cb>[0], _args: cbArgs)=> {
        if (!fuIsFragment(component)) {
          return cb(component,_args);
        }
      }
      return this.forEachComponent(_cb as Parameters<typeof this.forEachComponent>[0],args);
    }


  }<ComponentsRecordLrIdString>();  // end of $fu

  // #subInitReady = new FePromisewithResolvers<boolean>();
  // public get onSubInitReady () { return this.#subInitReady; }


  constructor(
    init: FuNavSubInit<ComponentsRecordLrIdString>,
  ) {
    super(init);
    super[$fu].getThis = init?.getThis; // getThis setter is not overrode
    // @TODO if getThis is not a sub-like
    this[$fu].space = init?.space;  // we might already know the space id from the id or spaceId in init tho we need the object which we get dynamically on bootstrapping
    // @TODO if space is not a map
    this[$fu].a = init?.a;
    // @TODO if a is not an anchor, panic?
    this[$fu].space?.subs?.set?.(this[$fu].id, this[$fu].getThis?.() as FuNavSub<ComponentsRecordLrIdString>); // @TODO might have the same effect with this (this of super)
    // this.#subInitReady.resolve(true);  @TODO there's noone to observe this during the importing phase
    // above setting means registering the sub's instantiation status with the parent space, constructor flow up to this point has to be quick
    // this.head.status = FuNavNodeStatusStrings.Instantiated; // @TODO
    // assign a componentName prop to singles (fragments assign this in constructor):
    const componentsEntries = Object.entries(this[$fu].getThis?.() as unknown as FuShapeofComponentsRec<
      // @ts-ignore @TODO
      Exclude<TSub,_FuNavComponentsRecKeys>
    >);
    this[$fu].forEachSingle?.(single => {
      fuAssignUnitField(single);  // just in case, and it won't overwrite the existing (due to decorator work may have already been done)
      if (!!single[$fu]) {
        for (const [name,_single] of componentsEntries) {
          if (single === _single) {
            single[$fu].componentName = name;
            this[$fu].a?.set?.(
              fuComponentIdfromName(name,this[$fu].subspaceId),
              single
            );
          }
        }
      } else {
        // @TODO if there's no $fu field that indicates a broader problem, log
      }
    });
  }
}

export type _FuNavComponentsRecKeys = keyof FuNavSub<string>;
export type _FuNavComponentsRecTypes = _ExtractTypesfromRecord<FuNavSub<string>>;

// type _FuNavComponentsRecordTypes =
//   | Promise<boolean>
//   | Record<
//       string,
//       Function | (() => Promise<unknown>)
//     >
//   | FuNavBaseHeader<string>
//   | (
//     (prepareFeedsJob: ((() => void) | (() => Promise<void>)),
//      onError?: (((e: unknown) => void) | undefined)) => Promise<>
//   )
