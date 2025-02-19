import { Context } from '../_shared/lit-imports.js';
import { type IFeReactiveBeat } from 'fe3/beat';
import type { IFeTextboxOptions, IFeTextboxStore } from '../comp-textbox/types.js';

export type IFePromptStore = {
  textbox: IFeTextboxStore
}
  & IFeReactiveBeat<number>
  ;
//* the usual strategy is to react on the store's beat and then check if the monitored value has also changed

export type IFeContextofPrompt = IFePromptStore;

export type IFePromptTextboxOptions = {
  contextObj?: Context<unknown, IFeContextofPrompt>,
}
  & IFeTextboxOptions
  ;
