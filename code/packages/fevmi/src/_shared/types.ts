import {
  type NID,
} from '../_integration/default-typing-and-naming.js';
export type {
  FeUsedbyappRenderResultT, NID,
  FeUsedbyappRefLIElementT, FeUsedbyappRefSpanElementT,
} from '../_integration/default-typing-and-naming.js';
export {
  feViewsIngressDefaults
} from '../_integration/default-typing-and-naming.js';


export type FeElementProps = {
  readonly fePart: string,
    // also serves as a substitution for html element's tagName as in log prefixes as some intermediary w-c-s
    // do intentionally have no defined element names for HTMLElementTagNameMap
}; // & FeStatefulObjProps;

/*
export interface FeStatefulIdentity {
  class?: string,
  branch?: string,
  element?: string|number,
}

export type FeStatefulObjProps = {
  [K in `fe${Capitalize<string & keyof FeStatefulIdentity>}`]?: string;
}

export type FePersistenceGetLeaf = (
  self: FeElementProps,
  identity?: FeStatefulIdentity,
) => {};
*/


export type FeNidGentrT <Tuner extends {}|string|number = string> = (
  tune?: Tuner
) => NID;


export type FeElementBaseConfig = {
  attributes?: Partial<Pick<Element,
    'id'|'slot'|'assignedSlot'
  >>,
  renderRoot?: HTMLElement|null,  // when null it returns this
  tuning?: {
    forceRequestViewUpdate?: {},
  },
  cbs?: {},
  /*stateful?: {  // @TODO the future home of loadable state
    getLeaf: FePersistenceGetLeaf,
  }*/
};

export type FeLayoutAndViewmodelConfigBase =
  FeElementBaseConfig & {
  layoutMethod?: string,
  layout?: {},
};

