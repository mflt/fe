import {
  html as lit_html, LitElement, PropertyValues, PropertyValueMap, nothing, render as lit_render,
  TemplateResult as Lit_TemplateResult,
  css as lit_css, CSSResult, CSSResultGroup, CSSResultArray,
  ReactiveController, ReactiveControllerHost, ReactiveElement, adoptStyles,
} from 'lit';
import { customElement, property, state, query, queryAsync, } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';
import {
  createContext, provide, consume, Context,
  ContextProvider, ContextConsumer, ContextRoot, ContextType, ContextEvent, ContextCallback
} from '@lit/context';
import {
  ref, createRef as lit_createRef, RefOrCallback, Ref as Lit_Ref,
} from 'lit/directives/ref.js';
import { when, } from 'lit/directives/when.js';
import { until, } from 'lit/directives/until.js';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat, KeyFn as Lit_KeyFn, } from 'lit/directives/repeat.js';
import {
  virtualize as lit_virtualize, VirtualizeDirectiveConfig, RenderItemFunction, virtualizerRef, VirtualizerHostElement,
} from '@lit-labs/virtualizer/virtualize.js';
import { LitVirtualizer, } from '@lit-labs/virtualizer';
import {
  BaseLayoutConfig, ScrollDirection
  // @ts-ignore bun specific complaint @TODO
} from '@lit-labs/virtualizer/layouts/shared/Layout.js';
import {
  flow as lit_flow, FlowLayout
} from '@lit-labs/virtualizer/layouts/flow.js';
import {
  grid as lit_grid, GridLayout
} from '@lit-labs/virtualizer/layouts/grid.js';
import {
  masonry as lit_masonry, MasonryLayout, MasonryLayoutConfig
} from '@lit-labs/virtualizer/layouts/masonry.js';
import { useController } from '@lit/react/use-controller.js';
import {
  SignalWatcher, signal, html as watched_html, watch, withWatch
} from '@lit-labs/preact-signals';
// import { spreads.. } from '@open-wc/lit-helpers'; when it gets compatible with lit 3.

export {
  LitElement, lit_render, lit_css, lit_html, classMap, styleMap, customElement, property, state, query, queryAsync,
  nothing, ref, until, when, lit_createRef, adoptStyles, useController,
  lit_flow, lit_grid, lit_masonry,
  directive, DirectiveResult, PartInfo,
};
export type {
  PropertyValues, PropertyValueMap, Lit_TemplateResult, RefOrCallback, Lit_Ref, StyleInfo, ReactiveElement,
  CSSResult, CSSResultArray, CSSResultGroup,
  LitVirtualizer, RenderItemFunction, VirtualizerHostElement, VirtualizeDirectiveConfig,
  FlowLayout, GridLayout, MasonryLayout, MasonryLayoutConfig,
  BaseLayoutConfig as Lit_BaseLayoutConfig, ScrollDirection as Lit_ScrollDirection,
  ContextType, ContextCallback, Context,
  ReactiveController, ReactiveControllerHost, Lit_KeyFn, PartType,
};
export {
  createContext, provide, consume,
  ContextRoot, ContextProvider, ContextConsumer, ContextEvent,
};
export { repeat, ifDefined };
export { lit_virtualize, virtualizerRef };
export {
  SignalWatcher, signal, watched_html, watch, withWatch,
}
