import {
  customElement, lit_html as html, lit_css as css, nothing, lit_createRef, PropertyValues,
  Lit_TemplateResult as TemplateResult, when, ref, lit_render, classMap,
} from '../_shared/lit-imports.js';
import {
  _feIsArray, _feIsFunction, _feIsObject,
} from '../_shared/fe-imports.js';
import {
  FeUsedbyappRenderResultT, FeUsedbyappRefLIElementT, FeUsedbyappRefSpanElementT,
  FeElementProps, FeLayoutAndViewmodelConfigBase,
} from '../_shared/types.js';
import { FeElementBaseWc, } from '../base/_element-base.js';


export type FeGridviewSchemes = 'grid5x5'|'grid3x5of11'|'grid3x5of7'|'flow';


export type FeGridviewOutletConfig <
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = FeLayoutAndViewmodelConfigBase &
  {
    layoutScheme?: FeGridviewSchemes,
    layout?: {
      direction: 'horizontal'|'vertical',
    },
  };

type _Templates <
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = {
  grid?: ()=> TemplateResult,
  /*wrapper?: (
    gridwChildren: TemplateResult,
  ) => TemplateResult,*/
}

type _TSlots = TemplateResult[];

// Also updates the shapes' 'refs' part according to the situation to reflect the render time values.
// An abstract class will never be instantiated so needs no customElements treatment
export abstract class FeGridviewOutletWc <
  RenderResult extends {} = FeUsedbyappRenderResultT,
>
  extends FeElementBaseWc<RenderResult>
{
  fePart = '_gridview-outlet';

  declare protected options: FeGridviewOutletConfig<RenderResult>;
  protected templates!: _Templates<RenderResult>;

  protected gridClassPin = {} as {[className in FeGridviewSchemes]: boolean};
  public readonly gridElRef = lit_createRef<HTMLDivElement>();
  #pylSlots!: _TSlots;
  #pylSlotsArePromised!: boolean;

  constructor(
    pylSlots: _TSlots | true,
    options?: FeGridviewOutletConfig<RenderResult>,
    templates?: _Templates<RenderResult>,
  ) {
    super(options);

    // State:
    this.pylSlots = this.#pylSlots || pylSlots;

    // View:
    this.templates = this.templates || templates; // might be already set being overridden upstream
    if (!_feIsObject(this.templates)) {
      this.templates = {};
    }

    const _fallbackLayoutScheme: FeGridviewSchemes = 'grid3x5of7';
    let _pinnedLayoutScheme: FeGridviewSchemes|undefined;
    let _defaultGridTemplate: TemplateResult|undefined;
    this.defaultGridTemplates.forEach( (t, sch) => {
      Object.assign(this.gridClassPin,{[sch]: false});
      if (sch===this.options.layoutScheme || !_defaultGridTemplate && sch===_fallbackLayoutScheme) {
        _pinnedLayoutScheme = sch;
        _defaultGridTemplate = t;
      }
    });
    if (_pinnedLayoutScheme) {
      this.gridClassPin[_pinnedLayoutScheme] = true; // _pinnedLayoutScheme prop is guaranteed to exist if _pinnedLayoutScheme set
      this.templates.grid = _feIsFunction(this.templates.grid)
        ? this.templates.grid!
        : ()=> _defaultGridTemplate!
      ;
    } else {
      this.templates.grid = ()=> html`${nothing}`;
    }
  }

  // State:

  protected get pylSlots (): Exclude<_TSlots, undefined> {
    return this.#pylSlots;
  }

  protected set pylSlots (
    pylSlots: ConstructorParameters<typeof FeGridviewOutletWc<RenderResult>>[0],
  ) {
    this.#pylSlotsArePromised = pylSlots === true;
    this.#pylSlots = _feIsArray(pylSlots) ? pylSlots as _TSlots : [];
  }

  public updatePylSlots (
    pylSlots: _TSlots,
  ): boolean {
    this.pylSlots = pylSlots;

    if (this.gridElRef.value) {
      // called with rendering possible
      this.updatePylSlotsinDom();
    } // otherwise it was called before firstUpdated and so will be

    return true;
  }

  // View

  protected updatePylSlotsinDom () {
    if (this.pylSlots && this.gridElRef.value) {
      while (this.gridElRef.value.firstChild) {
        this.gridElRef.value.removeChild(this.gridElRef.value.firstChild);
      }
      lit_render(this.pylSlots, this.gridElRef.value);
    }
  }

  protected override render (): TemplateResult {

    return html`
      <div
          ${ref(this.gridElRef)}
          class=${classMap(this.gridClassPin)}
      ></div>
    `;
  }

  protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const gridShadowRoot = this.gridElRef.value?.attachShadow({mode: 'open'});
    if (gridShadowRoot) {
      lit_render(
        this.templates.grid?.(),
        gridShadowRoot
      );
    }

    this.updatePylSlotsinDom();
  }

  static styles = [ // using array allows for merging styles upstream
    // below :host serves as the wrapper element, which is to be set upstream by redefining the :host
    css`
      :host {
        display: block;
        width: 100%;
        background-color: yellow;
      }

      .grid5x5 {
        display: grid;
        grid-template-areas:
          'NW NNW N NNE NE'
          'WNW head head head ENE'
          'W main main main E'
          'WSW foot foot foot ESE'
          'SW SSW S SSE SE'
        ;
        grid-template-columns: min-content min-content 1fr min-content min-content;
        grid-template-rows: min-content min-content 1fr min-content min-content;
      }

      .grid3x5of11 {
        display: grid;
        grid-template-areas:
          'NW N NE'
          'W head E'
          'W main E'
          'W foot E'
          'SW S SE'
        ;
        grid-template-columns: min-content 1fr min-content;
        grid-template-rows: min-content min-content 1fr min-content min-content;
      }
      
      .grid3x5of7 {
        display: grid;
        grid-template-areas:
          'N N N'
          'W head E'
          'W main E'
          'W foot E'
          'S S S'
        ;
        grid-template-columns: min-content 1fr min-content;
        grid-template-rows: min-content min-content 1fr min-content min-content;
      }
    `
  ];

  protected defaultGridTemplates = new Map<FeGridviewSchemes, TemplateResult>([

    ['grid3x5of7' /* fallback */, html`
      <span style="grid-area:head" class='head'>
        <slot name='head'>${nothing}</slot>
      </span>
      <span style="grid-area:main" class='main'>
        <slot name='main'>${nothing}</slot>
      </span>
      <span style="grid-area:foot" class='foot'>
        <slot name='foot'>${nothing}</slot>
      </span>
      <span style="grid-area:N" class='N'>
        <slot name='N'>${nothing}</slot>
      </span>
      <span style="grid-area:E" class='E'>
        <slot name='E'>${nothing}</slot>
      </span>
      <span style="grid-area:S" class='S'>
        <slot name='S'>${nothing}</slot>
      </span>
      <span style="grid-area:W" class='W'>
        <slot name='W'>${nothing}</slot>
      </span>
    `],

    // @TODO:
    ['grid3x5of11', html`
      <span style="grid-area:head" class='head'>
        <slot name='head'>${nothing}</slot>
      </span>
      <span style="grid-area:main" class='main'>
        <slot name='main'>${nothing}</slot>
      </span>
      <span style="grid-area:foot" class='foot'>
        <slot name='foot'>${nothing}</slot>
      </span>
      <span style="grid-area:N" class='N'>
        <slot name='N'>${nothing}</slot>
      </span>
      <span style="grid-area:E" class='E'>
        <slot name='E'>${nothing}</slot>
      </span>
      <span style="grid-area:S" class='S'>
        <slot name='S'>${nothing}</slot>
      </span>
      <span style="grid-area:W" class='W'>
        <slot name='W'>${nothing}</slot>
      </span>
    `],

    ['flow', html`
      
    `],
  ]);
}