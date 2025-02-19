import {
  FuFragment, _FuFragmentAny
} from '../fragment.js';


export const fuIsFragment = (
  that: unknown
): that is _FuFragmentAny  => that instanceof FuFragment;
