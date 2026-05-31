import type {
  _Fe_GConstructor, _Fe_GConstructor_Abstract,
} from 'fe3';
import { _feIsObject, } from 'fe3';
import type { FuComponentsUnitProps_Base, } from './_shared/types.js';
import {
  FuEStrings, FuEFeedKey, FuEViewKey, $fu,
  type FuEResourcekindsKeys
} from './_shared/strings.js';
import type {
  FuFeedTypes, FuViewTypes, FuSingleTypes, FuFeedResourceidLike, FuViewResourceidLike,
  FuResourceidsforOneFragment,
} from './_shared/types.js';
import {
  fuComponentIdfromName, fuResourceIdfromComponentId, fuToViewLocation,
} from './_shared/helpers.js';
import type { FuAnchorfromOneFragmentPerspective, } from './anchor.js';


// export type FuFragmentInflateviewSetFeed<View extends FuViewTypes> = (that: View) => void;

export type _FuFragmentAny = Omit<FuFragment<FuFeedTypes,FuViewTypes>,'nav'>; // @TODO omitting nav could be done better
export type FuAnyComponent = _FuFragmentAny|FuSingleTypes;

export type FuFeedTofFragment <Fg extends _FuFragmentAny> = Pick<Fg,FuEResourcekindsKeys.Feed>[FuEResourcekindsKeys.Feed];
export type FuViewTofFragment <Fg extends _FuFragmentAny> = Pick<Fg,FuEResourcekindsKeys.View>[FuEResourcekindsKeys.View];


export function fuWithFragmentSuperedInsert <
  ThatKind extends FuEFeedKey|FuEViewKey,
  TSuper extends InstanceType<_Fe_GConstructor<{}>>|InstanceType<_Fe_GConstructor_Abstract<{}>>, // @TODO be more sth like _Fe_GConstructor_Abstract<FeElementBaseWc>,
  Feed extends FuFeedTypes = ThatKind extends FuEFeedKey ? FuFeedTypes : never, // should be set to exact Feed type in case of a view initialization
  View extends FuViewTypes = FuViewTypes, // can remain defined a generic of ViewTypes in case of a feed initialization
> (
  Super: _Fe_GConstructor<TSuper>|_Fe_GConstructor_Abstract<TSuper>,
) {
  class Supered
    extends Super
  {
    readonly #fragment!: FuFragment<Feed,View>
    get fragment () {
      return this.#fragment;
    };
    get feed () {
      return this.fragment.feed;
    };
    get view () {
      return this.fragment.view;
    };
    resourceId: undefined|(()=> ThatKind extends FuEFeedKey ? FuFeedResourceidLike : FuViewResourceidLike);  // @TODO specify based on Fragment
    constructor(
      // thatType: FuEFeedKey|FuEViewKey, @TODO if needed in runtime
      fragment: FuFragment<Feed,View>,
      ...args: ConstructorParameters<typeof Super> // @TODO ...args typecheck does not work, see also TSupered below
    ) {
      super(args);
      // const fragment = args[0] as FuFragment<Feed, FuViewTypes>;
      // fragment.view = this as unknown as FuViewTypes;
      //  -- we rather assume that it always work in the frame of inflateView, so that assigns after View was created properly
      //  -- what if View constructor was called directly? The placing the working assignment here would work better, it this and super are the same @TODO does it/this works as expected?

      if (_feIsObject(fragment)) {
        // @ts-ignore
        this.#fragment = fragment;
        // this.fragment.feed.parentLo =
      } else {
        this.#fragment = {} as typeof fragment;
        // console.log
      }
    }
  }
  type TSupered = {
    new (fragment: FuFragment<Feed,View>, ...args: ConstructorParameters<typeof Super>): TSuper & Supered
  };
  return Supered as unknown as TSupered;
}


export abstract class FuFragment <
    Feed extends FuFeedTypes,
    View extends FuViewTypes = FuViewTypes, // @TODO remove default is messes up things
    FragmentNameString extends string = string,
  >
  // implements FuFragmentSharedProps
{
  // readonly #fragmentName!: string;  // like Function.name, local variant, keyString or 'foo-bar'; also useful for persistent storage

  public [$fu] = {} as FuComponentsUnitProps_Base; // Unit field, compatibility with Singles, where this is assigned by the sub's decorator or its constructor

  public get fragmentName () { return this[$fu].componentName || FuEStrings.Undefined; }
  readonly #subspaceId!: string;  // fq/lr assumed
  public get subspaceId () { return this.#subspaceId; }
  // private a: FuNavAnchor -- see constructor
  public get fragmentId () { return fuComponentIdfromName(this.fragmentName, this.subspaceId); }

  #feed: Feed;
  get feed () {
    return this.#feed;
  };
  set feed (
    feed: Feed
  ) {
    this.#feed = feed;
    /*if (this.#feed.fragmentName) {
      this.#fragmentName = this.#feed.fragmentName;
    } else {
      this.#feed.fragmentName = this.fragmentName;
    }*/
    this.#feed.resourceId = ()=> fuResourceIdfromComponentId(FuEFeedKey, this.fragmentId) as FuFeedResourceidLike;
    this.a.set<FuResourceidsforOneFragment<string,Feed,never>,Feed>(
      this.#feed.resourceId(),  // @TODO why does it error if the type is not forced above?
      this.#feed as Feed
    );
  }

  #view: View;
  get view () {
    return this.#view;
  };
  set view (
    view: View
  ) {
    this.#view = view;
    this.#view.resourceId = ()=> fuResourceIdfromComponentId(FuEViewKey, this.fragmentId) as FuViewResourceidLike;
    this.a.set<FuResourceidsforOneFragment<string,never,View>,View>(
      this.#view.resourceId(),
      this.#view as View
    );
  }

  public prepareFeed (
    CFeed: _Fe_GConstructor<Feed>,
    ...feedCtorArgs: ConstructorParameters<_Fe_GConstructor<Feed>>  // @TODO Constructor which returns args type correctly
  ) {
    this.feed = new CFeed(
      // FuEFeedKey,
      this,
      feedCtorArgs
    );
  }

  public inflateView (
    CView: _Fe_GConstructor<View>,
    ...viewCtorArgs: ConstructorParameters<_Fe_GConstructor<View>>  // @TODO Constructor which returns args type correctly
  ) {
    // const setFeed: FuFragmentInflateviewSetFeed<View> = that => {
    //   that.feed = this.#feed;
    // };
    this.view = new CView(
      // FuEViewKeyString,
      this,
      viewCtorArgs
    );
  }

  protected constructor(  // similar pattern to space
    fragmentName: string,
    subspaceId: string,  // ComponentsRecordLrIdString aka Fq aka spaceid in spaceid.foo already added; is not private as mutating spaceid might be a case, unlike anchor
    // space does not exist necessarily, so we expect anchor which we expect to exist and not change as a pillar of the fu env
    private a: FuAnchorfromOneFragmentPerspective<Feed,View>, // @TODO let it be a partial of the normal anchor
    initialLocationOrSelector?: Parameters<typeof fuToViewLocation>[0], // Parent node to attach to
  ) {
    this[$fu].componentName = fragmentName; // @TODO
    if (this.fragmentName===FuEStrings.Undefined) {
      // console.log @TODO
    }
    this.#subspaceId = subspaceId || FuEStrings.Undefined; // @TODO
    if (this.subspaceId===FuEStrings.Undefined) {
      // console.log @TODO
    }
    this.#feed = {} as Feed;
    this.#view = {} as View;
    /* this.#fragmentName = fragmentName || FuEStrings.Undefined; // @TODO
    if (this.fragmentName===FuEStrings.Undefined) {
      // console.log @TODO
    }*/
    // @TODO register the Fragment in a
    this[$fu].location = fuToViewLocation(initialLocationOrSelector);  // can also be set by the sub's decorator
  }
}