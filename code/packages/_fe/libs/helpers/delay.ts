import type { _Branded, _BrandofBranded } from '../core-types/helper.types.js';
import { _feIsNumber, _feIsofBrand } from '../probes/probes.js';

export type _FeMilliseconds = _Branded<number,'Milliseconds'>
export type _FeMillisecondsBrand = _BrandofBranded<_FeMilliseconds>

export const _feDelay = (
  milliseconds: number|_FeMilliseconds,
  handler?: Parameters<typeof setTimeout>['0']
) => new Promise(_ =>
  setTimeout(
    handler || (() => true),
    _feIsNumber(milliseconds) || _feIsofBrand(milliseconds,'Milliseconds')  // @TODO test
    ? milliseconds
    : 0
  )
);

export function _feDelaySync (
  milliseconds: number|_FeMilliseconds,
  handler?: Parameters<typeof setTimeout>['0']
) {
  (async () => await _feDelay(milliseconds,handler))();
  return;
}
