import type {
  NID,
} from '../_integration/default-typing-and-naming.js';
import { nanoid } from 'nanoid/non-secure';
import {
IFeValue, IFeShape,
} from 'fe3';
import {
  CFeAbstractEntitywithBeat,
} from 'fe3/beat';


export class FeSlicesStore<
  TSliceValue extends IFeValue,
  TSliceShape extends IFeShape<TSliceValue, 'id', number>, // @TODO
// TGroupShape extends IFeShape | undefined = undefined,
>
  extends CFeAbstractEntitywithBeat
{

  protected values: TSliceValue[] = [];

  slices = new Map<NID, TSliceShape>();

  // options?.flowbyRepeat: true
  // iterableByShapes: true

  constructor(
    private _values?: TSliceValue[]
  ) {
    super();
    this.values = _values ? _values : [];
  }

  appendSlice (newSliceValue: TSliceValue) {
    const arrIdx = this.values.push(newSliceValue);
    const valueId = newSliceValue.id || nanoid();
    this.slices.set(valueId,
      // @ts-ignore @TODO wtf?
      {
        getValueRef: () => this.values[arrIdx],
        valueId,
        idxs: {
          inFlow: this.slices.size,
          inValuesCollection: arrIdx,
        }
      });
  }
}
