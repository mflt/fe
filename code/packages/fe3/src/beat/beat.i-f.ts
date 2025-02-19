import type { __NID } from '../_integration/types.js';
import { _feIsNumber, } from '../../../_fe/code/packages/probes/probes.js';


export type IFeReactiveBeat<
  TBeat extends number | __NID | { [K: string]: number } = number | __NID,
  TPushBeat extends Function = { (): void }, // use non-arrow functions!
> = {
  beat: TBeat, // a counter of the item (value&shade/shape) changes to detect, or separate counters
  pushBeat?: TPushBeat;  // update/increment/etc the beat value
};

export type IFeEntitywithBeat<
  TBeat extends number | __NID | { [K: string]: number } = number | __NID,
  TPushBeat extends Function = { (): void }, // use non-arrow functions!
> =
  Object & IFeReactiveBeat<TBeat, TPushBeat>;


export abstract class CFeAbstractEntitywithBeat<
  TBeat extends number | __NID | { [K: string]: number } = number,
> {
  protected _beat = 0; // a counter of the item (value&shade/shape) changes to detect, or separate counters
  public get beat () { return this._beat; }
  public pushBeat () { return _feIsNumber(this._beat as number) ? ++(this._beat as number) : 0; }  // update/increment/etc the beat value
}
