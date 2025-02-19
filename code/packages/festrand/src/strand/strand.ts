import {
  type _NID, feCoreIngressDefaults,
} from '../_integration/abstract-typing-and-naming.js';
import {
  _feIsFunction, _feIsMap, FeDoesEntryFit,
} from 'fe3/utils';
import type {
  IFeValue,
  IFeShape, IFeTriplet, FeTripletsArray, FeDoesTupleFit, FeShapePartfromTripletGentr, IFeTripletHelpers,
} from 'fe3/triplet';
import type {
  FeValuesinStrand, FeShapesinStrand,
} from './types.js';
import {
  CFeAbstractEntitywithTripletManipulators
} from './triplets-manipulators.js';


export type _FeStrandOptionsMarkers = IFeShape['markers'];  // @TODO


export type FeStrandConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
> = {
  options: {
    markers?: _FeStrandOptionsMarkers,  // undefined markers also have meaning, @TODO shape's type markers are not affected by this, so ...
    valueIdKey?: TValue extends Array<infer _FeDefaultKeyofId> ? _FeDefaultKeyofId : string, // 'id',
  },
  helpers?: IFeTripletHelpers<TValue, TShape>,
}

export const emptyFeStrandConfig = {
  options: {}
};


export class CFeStrand<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
>
  extends CFeAbstractEntitywithTripletManipulators<TValue,TShape>
  // implements IFeReactiveBeat<number>
{
  public readonly options: FeStrandConfig<TValue, TShape>['options'];

  public isDefined: boolean = false;  // used to allow for non nil object but still unusable and testable for that usability
  public isPromised: boolean = false;  // user code promised to define it soon, used in the init phase, see isDefined

  // _beat -- override if not number
    // utilizes CFeReactiveBeat<number> and tries to be closer to the lit @state implementation
    // optional, using the beat in the context is sometimes more practical in lit, or preact-signals
  // pushBeat -- override if functions otherwise or the beat is overridden which may brake this

  protected _values: FeValuesinStrand<TValue,TShape> = null;  // non-defined-ness should be set explicitly  //  @TODO review implications on the internal ancient typings
  protected _shapes: FeShapesinStrand<TValue,TShape> = null;  // non-defined-ness should be set explicitly

  // get strandName() { return this.options.strandName; }

  get values() {
    return this._values;
  };
  // for external mutation use initValues to set the initial collection and the collection ref;
  // setting value entries is not supported by design, except the valuesAppend case
  get shapes() {
    return this._shapes;
  };  // for external mutation use initShapes and setShapeEntry
  // no setters for the two

  // this.helpers -- aka tripletHelpers in the super
  // this._iterableByShapes -- in the super

  constructor(
    config: Partial<FeStrandConfig<TValue, TShape>>,
    valuesRefOrFn?: CFeStrand<TValue, TShape>['_values'],
    shapesRefOrFn?:
      CFeStrand<TValue, TShape>['_shapes'] |
      FeShapePartfromTripletGentr<TValue, TShape>,
    // ...rest: any[]
  ) {
    super();
    this.options = (config?.options as typeof this.options)
      || emptyFeStrandConfig.options;  // when coming from strand viewmodel constructor this one is set in the config.options prop already
      // is to set the upstream specific (strand viewmodel) options here
      // works together with the next statement
    this.options.markers ||= {};
    // @ts-ignore @TODO see also the initiation of options member in strand vm
    this.options.valueIdKey ||= feCoreIngressDefaults.keyPropName; // is set anyway
    // this.options.catStrandName ||= frankieDefaults.defaultCatsStrandName;
    // console.log('[fe-strand] Constructor fired', config.options, this.options)

    this.helpers = config?.helpers || {};

    this._iterableByShapes = this.options.markers.iterableByShapes || !valuesRefOrFn;

    const _shapesRef = _feIsFunction(shapesRefOrFn) ? undefined : shapesRefOrFn,
      _shapefrom3 = _feIsFunction(shapesRefOrFn) ? shapesRefOrFn : undefined;
    this.resetShapes(
      _shapesRef, _shapefrom3
    );
    this.relinkValues(
      valuesRefOrFn,
      _shapesRef, _shapefrom3
    );  // resets shapes again if shapesResetOnValuesReset set

    // console.warn(`[${this.options.strandName}] Strand constructed`)

    // @TODO most probably all triplet collections are undefined at this point depending on the instance bootstrap
  }


  public relinkValues (
    newValues?: typeof this._values,
    newShapes?: typeof this._shapes,
    shapePartfrom3?: FeShapePartfromTripletGentr<TValue, TShape>,
  ) {
    try {
      this._values = newValues || null; // can be undefined converted to null
      /* if (!this.actions) {
        throw (`actions are not ready`);
      } */
      /* if (!this.actions.findItemPyl) {  // @TODO might go to the constructor
        this.actions.findItemPyl =
          ((idxOrItem) => feFindInPyls(this._pyls, idxOrItem)) as FnFeFindInPyls<TValue>;
      } */
      if (!!newShapes || this.options.markers?.shapesResetOnValuesReset) {
        this.resetShapes(
          newShapes,
          shapePartfrom3
        );  // @TODO might already be enough, see the below forEachValue
      }
      if (!this._shapes) {
        throw (`shapes are undefined`);
      }
      this.forEachValue(
        (value, idx) => this.setShapesEntry({ value, idx: idx as string })  // @TODO what if number
      );
      // this.actions.strand?.requestViewUpdate?.(); // @TODO may not make an exception in not touching ui!
    } catch (err) {
      console.warn(`[fe-strand] Couldn't link payload:`, err);
    }
  }


  public resetShapes(
    newShapes?: typeof this._shapes,  // @TODO implement
    shapePartfrom3?: FeShapePartfromTripletGentr<TValue, TShape>,
  ) {
    if (!!this._shapes) {
      console.warn(`[fe-strand] Resetting old shapes with new ones`);
      // return;
    }
    if (!!newShapes) {
      this._shapes = newShapes;
    } else {
      // console.warn(`${this.options.strandName} shapes reset with new instance`)
      // @ts-ignore @TODO
      this._shapes = this.options.markers?.shapesAreWeakmap
        ? new WeakMap<TValue, TShape>()
        : new Map<_NID, TShape>();
    }

    const _fnShapePartfrom3 = shapePartfrom3 || this.helpers?.shapePartfrom3;
    if (_feIsFunction(_fnShapePartfrom3)) {  // FeShapefrom3Gentr
      this.forEachValue((value, idx) => {
        const shape = this.getShapesEntry(
          this.options.markers?.shapesAreWeakmap
            ? value as unknown as TShape  // @TODO check if this is what we intended
            : idx
        );  // @TODO does not handle the shapes are Array case which might be an excluded case by design
        this.setShapesEntry(
          // @ts-ignore
          { value, shape, idx },
          _fnShapePartfrom3
        )
      })
    }
  }


  public override getValuesEntry (
    idx: _NID | number | TShape,  // @TODO is it TShape that indexes its weakmap?
  ) {
    return super.getValuesEntry (
      // @ts-ignore @TODO
      this._values,
      idx
    );
  }

  public override getShapesEntry (
    idx: _NID | number | TShape | undefined, // @TODO if shapes were an Array idx might mean the iterable of idx key matching the value inx
  ) {
    return super.getShapesEntry(
      // @ts-ignore @TODO
      this._shapes || undefined,  // null > undefined
      idx
    );
  }

  public override forEachValue (
    cb: (
      value: TValue,
      idx: number | string,
      // doesEntryFit?: FeDoesEntryFit<TValue,TShape>,
    ) => void,
    doesEntryFit?: FeDoesEntryFit,
    groups?: TShape['groups'],  // not implemented, reserved for filtering by shape.groups
  ) {
    return super.forEachValue(
      cb, doesEntryFit, groups,
      this._values,
    );
  }

  public override forEachShape (
    cb: (
      shape: TShape,
      idx: number | string,
      // doesEntryFit?: FeDoesEntryFit<TValue,TShape>,
    ) => void,
    doesEntryFit?: FeDoesEntryFit,
    groups?: TShape['groups'],  // for filtering by groups association wrt the shape.groups
  ) {

    return super.forEachShape(
      cb,
      doesEntryFit,
      groups,
      this._shapes,
    );
  }

  public override setShapesEntry (
    triplet: IFeTriplet<TValue,TShape>,
    shapePartfrom3?: FeShapePartfromTripletGentr<TValue,TShape>|false, // setting to false prevents the helper to be used
  ) {
    return super.setShapesEntry(
      triplet,
      shapePartfrom3,
      this._shapes,
    );
  }

  public override appendEntry (
    triplet: IFeTriplet<TValue, TShape>,
    appendValueFn?: (triplet?: IFeTriplet<TValue,TShape>) => boolean|void|number, // should return false if failed
    suppressPushingBeat?: boolean,
  ) {
    return super.appendEntry(
      triplet,
      appendValueFn,
      suppressPushingBeat,
      (triplet: IFeTriplet<TValue,TShape>) => this.setShapesEntry(triplet),
    );
  }

  public override prependEntry ( // @TODO implement for shapes other than array
    triplet: IFeTriplet<TValue,TShape>,
    prependValueFn?: (triplet?: IFeTriplet<TValue,TShape>) => boolean|void|number, // should return false if failed
    suppressPushingBeat?: boolean,
  ) {
    return super.prependEntry(
      triplet,
      prependValueFn,
      suppressPushingBeat,
      (triplet: IFeTriplet<TValue,TShape>) => this.setShapesEntry(triplet),
      // @ts-ignore @TODO
      this._shapes as Array<TShape>
    );
  }

  // See in super
  public override populate3Arr (
    triplets: FeTripletsArray<TValue, TShape>,
    options?: {
      doesEntryFit?: FeDoesEntryFit | FeDoesTupleFit<TValue, TShape>, // filtering @TODO Both types?
      groups?: TShape['groups'],  // for filtering by groups association wrt the shape.groups
      compareFninSort?: IFeTripletHelpers<TValue, TShape>['compareFninSort'],
        // * true means using Array.sort w/o a specific compare fn.
    }
  ) {
    return super.populate3Arr(
      triplets,
      options,
      this._values,
      this._shapes,
    );
  }

  // private static _pylsAreInMap = (self: typeof this) => (self._pyls instanceof Map);

  readonly valuesAreInMap = () => _feIsMap(this._values);  // @TODO the not yet ready case when used below
  readonly valuesAreByFunction = () => _feIsFunction(this._values);  // @TODO the not yet ready case when used below
}


/* export function MixableStoreofStrand<
  TValue extends IFePyl,
  TShape extends IFeShape,
  RenderResult = TFeDefaultRenderResult,
  TMergedStore extends _Fe_GConstructor<any> = _Fe_GConstructor<any>, // actually no constraint, any class, to merge upstream fields and methods
>
(
  config: FeStoreofStrandConfig<TValue, TShape, RenderResult>,
  MergedStore: TMergedStore,
) {
return class MixedStrandClass extends CFeStoreofStrand<TValue,TShape,RenderResult> implements TMergedStore;
} */


//export const AbstractStoreofStrand = MixableStoreofStrand(emptyFeStrandConfig, class { });
//export type TAbstractStoreofStrand = typeof AbstractStoreofStrand;

/* export type FeMarkerinStore<
  MarkersI extends _Fe_MarkerToExtend = FeShape<{ pylsInMap: true }>,
  ExoticPartI extends _Fe_AnyI = {},
> = FeShape<
  MarkersI,
  ExoticPartI & (
    MarkersI extends { scrollIdxPresent: true } ? {
      idx: FeScrollerIndex, //  virtual scroller idx
      // el?: HTMLElement,
    } : {}
  )>;

export type FeMarkerinStoreForScroll<
  MarkersI extends _Fe_MarkerToExtend & { scrollIdxPresent: true } = FeShape<{ pylsInMap: true, scrollIdxPresent: true }>,
  ExoticPartI extends _Fe_AnyI = {},
> = FeMarkerinStore<MarkersI, ExoticPartI>; */
