import {
  LitElement, ReactiveElement, Context, ContextConsumer, ContextCallback
} from '../_shared/lit-imports.js';
import {
  type IFeEntitywithBeat, CFeAbstractEntitywithBeat
} from 'fe3/beat';


// export type _FeHasStore<T,TStore> = T extends TStore ? T : T extends {[store: string]: TStore} ? T : never;

export const altSubscribetoContext = <
  TStrandvm extends CFeAbstractEntitywithBeat|IFeEntitywithBeat,
  TContext extends TStrandvm | { [key in `${StoreKey}`]: TStrandvm } = TStrandvm,  // @TODO
  StoreKey extends string = 'store'
> (
  self: LitElement, // @TODO the manifest element rather
  strandvmRef: TStrandvm|undefined | true, // true means that strandvmRef will be defined soon
  context?: Context<unknown, TContext>,
  consumerCb?: ContextCallback<TStrandvm>
) =>
    !strandvmRef && !!context   // strandvmRef (store in terms of festrand beat) is not provided and not indicated that it will be
    // @ts-ignore @TODO must be a lit3 vs lit2 problem
    ? new ContextConsumer(
      self,
      {
        context,
        subscribe: true,
        callback: consumerCb,
      })
    : undefined //  strand is present (or is to be created soon) and we use it instead of the context @TODO not intuitive, see the always following getter
  ;


export const altCreateRenderRoot = (
  renderRoot: HTMLElement | null | undefined,
  self: LitElement,
  fallBack: LitElement['createRenderRoot']
): LitElement['createRenderRoot'] => renderRoot
    ? () => renderRoot as HTMLElement
    : renderRoot === null
      ? () => self
      : fallBack
  ;
