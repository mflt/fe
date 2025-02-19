import { createContext } from '../_shared/lit-imports.js';
import { type IFeContextofPrompt } from './types.js';

const defaultSymbolDescription = 'fe-context-of-prompt' as const;

export const createContextofPrompt = <
  T = IFeContextofPrompt  // @TODO
>(
  symbolDescription?: string,
) =>
  createContext<
    IFeContextofPrompt
  >(Symbol(symbolDescription || defaultSymbolDescription));
