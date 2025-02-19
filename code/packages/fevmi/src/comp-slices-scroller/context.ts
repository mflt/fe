import { createContext } from '../_shared/lit-imports.js';
import { CFeAbstractEntitywithBeat, } from 'fe3/beat';

const defaultSymbolDescription = 'context-of-slices-scroller' as const;

export const createContextofSlicesScroller = <
  TStore extends CFeAbstractEntitywithBeat,
  TContext extends TStore | { [key in `${StoreKey}`]: TStore } = TStore,  // @TODO
  StoreKey extends string = 'store'
>(
  symbolDescription?: string,
) =>
  createContext<TContext>(Symbol(symbolDescription || defaultSymbolDescription))
;

