import type {
  _NID, _FeDefaultKeyPropName,
} from '../_integration/abstract-typing-and-naming.js';
import {
  _feIsArray, _feIsFunction, _feIsWeakMap, feForEachinCollection,
  feGetCollectionEntry, fePrependEntrytoCollection, feSetCollectionEntry, FeDoesEntryFit,
} from 'fe3/utils';
import { CFeAbstractEntitywithBeat, } from 'fe3/beat';
import type {
  FeValuesCollection, IFeValue,
  FeDoesTupleFit,
  FeShapePartfromTripletGentr,
  FeShapesArray, FeShapesMap, FeShapesWeakMap, FeTripletsArray, IFeShape, IFeTriplet, IFeTripletHelpers
} from 'fe3/triplet';
import type {
  FeValuesinStrand, FeShapesinStrand,
} from './types.js';


type __FeSetCollectionEntry_ReturnType = ReturnType<typeof feSetCollectionEntry>;


export type FePopulate3ArrParams<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
> = Exclude<Parameters<CFeAbstractEntitywithTripletManipulators<TValue, TShape>['populate3Arr']>[1], undefined>;  // @TODO make it a named inference


export abstract class CFeAbstractEntitywithTripletManipulators <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
>
  extends CFeAbstractEntitywithBeat<number> // if js supported multiple inheritance this would've not been here
{

  // a store for values and shapes is not implemented here, as this also serves implementations which
  // utilize an external strand store, like the slicer or sequencer do.
  // This also allows for a way to implement different entities for views on a shared strand(ed) dataset.

  public helpers: IFeTripletHelpers<TValue, TShape> = {};

  protected _iterableByShapes!: boolean; // also enables filtering by shape.groups in populate3Arr

  public getValuesEntry (
    idx: _NID|number|TShape,  // @TODO is it TShape that indexes its weakmap? Why no undefined as with shapes
    _values: FeValuesinStrand<TValue,TShape>|undefined,
  ) {
    // if (!_values) {
    //   return undefined;
    // }
    return feGetCollectionEntry<TValue>(
      // @ts-ignore @TODO
      _values,
      idx
    );
  }

  public getShapesEntry (
    idx: _NID|number|TShape|undefined, // @TODO if shapes were an Array idx might mean the iterable of idx key matching the value inx
    _shapes: FeShapesinStrand<TValue,TShape>|undefined,
  ) {
    return feGetCollectionEntry<TShape>(
      _shapes || undefined,  // null > undefined
      idx
    );
  }

  public forEachValue (
    cb: (
      value: TValue,
      idx: number|string,
      // doesEntryFit?: FeDoesEntryFit<TValue,TShape>,
    ) => void,
    doesEntryFit: FeDoesEntryFit|undefined,
    groups: TShape['groups']|undefined,  // not implemented, reserved for filtering by shape.groups
    _values: FeValuesinStrand<TValue,TShape>,  // not optional, assumed to be set in the overriding child
  ) {
    return feForEachinCollection<TValue>(
      // @ts-ignore @TODO
      _values,
      cb, doesEntryFit
    );
  }

  public forEachShape (
    cb: (
      shape: TShape,
      idx: number|string,
      // doesEntryFit?: FeDoesEntryFit<TValue,TShape>,
    ) => void,
    doesEntryFit: FeDoesEntryFit|undefined,
    groups: TShape['groups']|undefined,  // for filtering by groups association wrt the shape.groups
    _shapes: FeShapesinStrand<TValue,TShape>,  // not optional, assumed to be set in the overriding child
  ) {
    const doesEntryFitAndAlsoWrtGroups: FeDoesEntryFit = shape =>
      !groups || !groups.length || shape?.groups?.some((g: string) => (groups as string[])?.includes(g))
        ? !doesEntryFit || doesEntryFit(shape)
        : false
    ;
    return feForEachinCollection<TShape>(
      // @ts-ignore @TODO
      _shapes,
      cb,
      doesEntryFitAndAlsoWrtGroups
    );
  }

  public setShapesEntry(
    triplet: IFeTriplet<TValue,TShape>,
    shapePartfrom3: FeShapePartfromTripletGentr<TValue,TShape>|false |undefined, // setting to false prevents the helper to be used
    _shapes: FeShapesinStrand<TValue,TShape>,
  ) {
    if (!triplet || !_shapes) {
      return false;
    }
    const _shapePartfromFn = (_feIsFunction(shapePartfrom3)
        ? shapePartfrom3
        : shapePartfrom3 !== false
          ? this.helpers?.shapePartfrom3
          : () => { }
    )?.(triplet);
    const _shapePartfromTriplet = {
      ...triplet.shape,
      valueRef: triplet.value,
      // valuePartfrom3: this.actions?.helpers?.valuePartfrom3,  // @TODO this one is strand level, does not belong here strictly
    } as TShape;
    const shapeToAssign = { ..._shapePartfromTriplet, ..._shapePartfromFn };
    if (_feIsWeakMap(_shapes)) {
      if (!triplet.value) {
        console.log('bad shape init, no value') // @TODO
        return false;
      } else {
        return (_shapes as FeShapesWeakMap<TShape>).set(
          // @ts-ignore @TODO
          triplet.value,
          shapeToAssign
        );
      }
    } else {
      return feSetCollectionEntry(
        _shapes,
        shapeToAssign,
        triplet.idx || triplet.value?.id,
      );
    }
  }


  public appendEntry (
    triplet: IFeTriplet<TValue,TShape>,
    appendValueFn: ((triplet?: IFeTriplet<TValue,TShape>) => __FeSetCollectionEntry_ReturnType|void) |undefined, // should return false if failed
    suppressPushingBeat: boolean|undefined,
    _setShapeFn: (triplet: IFeTriplet<TValue,TShape>) => void|any, // return value is not processed
  ): __FeSetCollectionEntry_ReturnType|void {
    if (!triplet || !_feIsFunction(_setShapeFn)) {
      return false;
    }
    const _appendValue = _feIsFunction(appendValueFn)
      ? ()=> appendValueFn(triplet)
      :
      () => feSetCollectionEntry<TValue>(
        // @ts-ignore @TODO
        this._values,
        // @ts-ignore @TODO
        triplet.value,
        triplet.idx || triplet.value?.id
      )
    const valueDone = _appendValue();
    if (valueDone !== false) {
      _setShapeFn(triplet);
      if (!suppressPushingBeat) {
        this.pushBeat?.();
      }
    }
    return valueDone;
  }

  public prependEntry (
    triplet: IFeTriplet<TValue, TShape>,
    prependValueFn: ((triplet?: IFeTriplet<TValue, TShape>) => __FeSetCollectionEntry_ReturnType|void) |undefined, // should return false if failed
    suppressPushingBeat: boolean|undefined,
    _setShapeFn: (triplet: IFeTriplet<TValue,TShape>) => void|any, // return value is not processed,
    _shapes: FeShapesArray<TShape>,  // @TODO implement for shapes other than array
  ): __FeSetCollectionEntry_ReturnType|void {
    if (!triplet || !_feIsFunction(_setShapeFn) || !_shapes) {
      return false;
    }
    const _prependValue = _feIsFunction(prependValueFn)
      ? ()=> prependValueFn(triplet)
      :
      () => fePrependEntrytoCollection<TValue>(
        // @ts-ignore @TODO
        this._values,
        // @ts-ignore @TODO
        triplet.value,
      )
    const valueDone = _prependValue();
    if (valueDone !== false) {
      if (_feIsArray(_shapes)) {
        (_shapes as Array<TShape>).unshift(triplet.shape || {} as TShape);
        _setShapeFn({
          ...triplet,
          idx: '0'
        });
        if (!suppressPushingBeat) {
          this.pushBeat?.();
        }
      } else {
        console.log('prependEntry works with array shapes yet only');
        return false;
      }
    }
    return valueDone;
  }


  // Fills in the present entries of values and shapes into an array,
  // a filter may apply, sorting can happen.
  // Returns the triplet array reset and filled, does not create triplet array. On improper input returns false.
  // Shape entries are updated in a values driven case.
  // Depending on the _iterableByShapes setting values or shapes are the base iterator, and that part of the
  // subject dataset is to be a defined input. The other dataset part in the triplets if undefined will not result in
  // a failure but the result is not predictable in this abstract implementation.
  public populate3Arr (
    triplets: FeTripletsArray<TValue, TShape>,
    options: {
      doesEntryFit?: FeDoesEntryFit | FeDoesTupleFit<TValue, TShape>, // filtering @TODO Both types?
      groups?: TShape['groups'],  // for filtering by groups association wrt the shape.groups
      compareFninSort?: IFeTripletHelpers<TValue, TShape>['compareFninSort'],
      // * true means using Array.sort w/o a specific compare fn.
    } |undefined,
    _values: FeValuesinStrand<TValue,TShape>,  // not optional, assumed to be set in the overriding child
    _shapes: FeShapesinStrand<TValue,TShape>,
  )
  : FeTripletsArray<TValue, TShape>|false
  {
    // console.warn(`${this.options.strandName} triplets ${triplets.length}`)
    if (!this._iterableByShapes ? !_values : !_shapes) {
      console.log('[FE/populate3Arr] subject dataset is not ready');
      // return false; is handled in the below logic
    }
    if (!triplets || !_feIsArray(triplets)) {
      console.log('[FE/populate3Arr] arrayRef was not ok');
      return false;
    }
    triplets.length = 0;  // resets the array with proper cleanup of the contained refs (dont use = [])
    let _idx = 0;
    if (!this._iterableByShapes && !!_values) { // the default
      const _setShapein3 = (value: TValue, idx: number | string) => {
        const shape = this.getShapesEntry(
          _feIsWeakMap(_shapes)
            ? value as unknown as TShape // @TODO check if this is what we intended
            : idx, // @TODO which id?
          _shapes, // may arrive as an undefined to this point without warning
        );
        triplets[_idx++] = {
          value, shape,
          // @ts-ignore
          idx
        };
      };
      this.forEachValue(_setShapein3, options?.doesEntryFit, options?.groups, _values);  // @TODO groups is to be implemented

    } else if (this._iterableByShapes && !!_shapes) { // a clone modded for iterableByShapes, also able to filter by groups
      const _setValuein3 = (shape: TShape, idx: number | string) => {
        const value = this.getValuesEntry(
          _feIsWeakMap(_values) ? shape : idx, // @TODO which?
          _values, // may arrive as an undefined to this point without warning
        );
        triplets[_idx++] = {
          value, shape,
          // @ts-ignore
          idx
        };
      };
      // console.warn(`${this.options.strandName} shapes each idx ${this.shapes?.size}`)
      this.forEachShape(_setValuein3, options?.doesEntryFit, options?.groups, _shapes);

    } else {
      // triplets.length = 0; if wasn't set in the init phase
      console.log('[FE/populate3Arr] values, shapes or iterableByShapes were are not present in a workable combination');
      return triplets;
    }
    const _compareFninSort = options?.compareFninSort || this.helpers.compareFninSort;
    if (!!_compareFninSort) {
      triplets?.sort( // mind the unpredictable case with the other part of the dataset being undefined
        _compareFninSort === true ? undefined : _compareFninSort
      );
    }
    return triplets;
  }

  /*getItemPyl(id: NID): TValue | undefined {
    // @ts-ignore
    return _feIsMap(this._values)
      ?
      this._values.get(id) // @TODO any?
      :
      (this._values as unknown as FeValuesArray<TValue>).find(item => item.id == id);  // @TODO
  }*/

}

