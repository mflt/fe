import {
  FuFragment, _FuFragmentAny
} from '../fragment.js';


export const fuIsFragment = (
  that: unknown
): that is _FuFragmentAny  => that instanceof FuFragment;

export const fuIsValidPosition = (
  position: HTMLElement|null|undefined,
) : position is HTMLElement => !!position?.parentNode || position?.parentNode instanceof DocumentFragment;

