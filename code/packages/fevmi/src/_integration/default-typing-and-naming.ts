import {
  feCoreIngressDefaults, type IFeAbstractTypingAndNamingTokens,
} from 'festrand';
import type {
  Context, ContextConsumer, Lit_Ref as Ref,
  Lit_TemplateResult as TemplateResult, LitElement,
  RenderItemFunction
} from '../_shared/lit-imports.js';
import {
  lit_html as html, nothing
} from '../_shared/lit-imports.js';

// see festrand/ abstract-typing-and-naming.ts


export interface IFeDefaultTypingAndNamingTokens <T = any> extends IFeAbstractTypingAndNamingTokens {

  defaults: Omit<IFeAbstractTypingAndNamingTokens['defaults'],'groupPropName'|'renderNothing'> &
    // this intersection has no effective meaning just serves as a reference for implementing the upstream changes
    // groupedStrandLabel also already defined by the festrand abstract version properly
    {
    // keyPropName: string,
    groupPropName: string,
    // strandLabel: string,
    groupedStrandLabel: string,
    renderNothing: ()=>TemplateResult, // @TODO
  },
  coreTs: {
    NID: string;
  },
  viewTs: {
    RenderResultT: TemplateResult,
    WcElementT: LitElement,
    RefListElementT: Ref<HTMLUListElement>,
    RefLIElementT: Ref<HTMLLIElement>,
    RefSpanElementT: Ref<HTMLSpanElement>,
    ContextConsumerT: ContextConsumer<Context<unknown, {}>, any>,
    RenderItemFunctionT: RenderItemFunction<T>,
  },
}

declare namespace feTypingAndNamingTokens {
  var defaults: IFeDefaultTypingAndNamingTokens['defaults'];
  var coreTs: IFeDefaultTypingAndNamingTokens['coreTs'];
  var viewTs: IFeDefaultTypingAndNamingTokens['viewTs'];
}

declare namespace globalThis {
  var feTypingAndNamingTokens: IFeDefaultTypingAndNamingTokens;  // var is important
}


(function () {
  if (!('feTypingAndNamingTokens' in globalThis)) {
    console.log(`[fevmi]: feTypingAndNamingTokens global variable does no exist, creating. Its "factory defaults" will be in effect.`);
    globalThis.feTypingAndNamingTokens = {} as IFeDefaultTypingAndNamingTokens;
  } else {
    console.log(`[fevmi]: feTypingAndNamingTokens global variable properly exists.`,
      !globalThis.feTypingAndNamingTokens
        ? `It is falsy/undefined though -- "factory defaults" will prevail (which in most cases is the normal operation).`
        : ""
    );
  }
})();


export type NID = typeof feTypingAndNamingTokens['coreTs']['NID'] extends unknown //  @TODO review wrt festrand and fe3
  ? string
  : typeof feTypingAndNamingTokens['coreTs']['NID'];


export const feViewsIngressDefaults = {
  ...feCoreIngressDefaults,
  groupPropName: feTypingAndNamingTokens?.defaults?.groupPropName || 'group',
  groupedStrandLabel: feTypingAndNamingTokens?.defaults?.groupedStrandLabel || 'myGroupedStrand',
  renderNothing: feTypingAndNamingTokens?.defaults?.renderNothing as ()=>FeUsedbyappRenderResultT ||
    (() => html`${nothing}`),
};

type __FeIngressViewTs <T> = typeof feTypingAndNamingTokens['viewTs'];

// Naming like Usedbyapp reflects that it is likely that the upstream app uses something like Adobe Spectrum
// Note that frankie components are coded so to be pure Lit so the below has not much effect in case of the most components/utilities here

export type FeUsedbyappRenderResultT<T = any> =
  __FeIngressViewTs<T>['RenderResultT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['RenderResultT']
    : __FeIngressViewTs<T>['RenderResultT']
  ;
export type FeUsedbyappWcElementT<T = any> =
  __FeIngressViewTs<T>['WcElementT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['WcElementT']
    : __FeIngressViewTs<T>['WcElementT']
  ;
export type FeUsedbyappRefListElementT<T = any> =
  __FeIngressViewTs<T>['RefListElementT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['RefListElementT']
    : __FeIngressViewTs<T>['RefListElementT']
  ;
export type FeUsedbyappRefLIElementT<T = any> =
  __FeIngressViewTs<T>['RefLIElementT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['RefLIElementT']
    : __FeIngressViewTs<T>['RefLIElementT']
  ;
export type FeUsedbyappRefSpanElementT<T = any> =
  __FeIngressViewTs<T>['RefSpanElementT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['RefSpanElementT']
    : __FeIngressViewTs<T>['RefSpanElementT']
  ;
export type FeUsedbyappContextConsumerT<T = any> =
  __FeIngressViewTs<T>['ContextConsumerT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['ContextConsumerT']
    : __FeIngressViewTs<T>['ContextConsumerT']
  ;
export type FeUsedbyappRenderItemFunctionT<T> =
  __FeIngressViewTs<T>['RenderItemFunctionT'] extends unknown
    ? IFeDefaultTypingAndNamingTokens<T>['viewTs']['RenderItemFunctionT']
    : __FeIngressViewTs<T>['RenderItemFunctionT']
  ;
