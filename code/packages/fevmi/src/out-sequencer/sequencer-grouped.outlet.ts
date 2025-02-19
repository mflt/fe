import {
  state, ref, lit_createRef, styleMap, PropertyValues, lit_css as css, lit_html as html, Lit_TemplateResult,
  LitElement, customElement, lit_flow, Lit_BaseLayoutConfig, lit_virtualize, nothing, virtualizerRef,
  StyleInfo, VirtualizerHostElement, RenderItemFunction, Lit_TemplateResult as TemplateResult, when,
} from '../_shared/lit-imports.js';
import {
  IFeValue, IFeShape,
} from '../_shared/fe-imports.js';
import {
  FeUsedbyappRenderResultT,
} from '../_shared/types.js';
import {
  CFeStrandViewmodel, FeInstrandGroupTemplate, FeInstrandCellWrapperTemplate, emptyFeStrandVmConfig,
} from '../strand-viewmodel/index.js';
import {
  _FeSequencerBaseOutletWc, FeSequencerBaseOutletConfig, _IFeShapewithFlowRefs,
  repeaterWrapperClasses, cellWrapperWrapperClasses
} from './_sequencer-base.outlet.js';


export type FeSequencerGroupedOutletConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> =
  FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> &
  {
    layout?: FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['layout'] & {
      styles?: Readonly<StyleInfo>,
    },
    groups?: IFeShape<TValue>['groups'],
  };

type _Templates <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> = {
  group: FeInstrandGroupTemplate<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
  child: FeInstrandCellWrapperTemplate<TValue,TShape,RenderResult>
};


// @TODO<x>
// Also updates the shape entries according to the situation to reflect the render time values.
@customElement('fe-sequencer-grouped-outlet_')  // needs this customElements handling in order to be instantiated
export class FeSequencerGroupedOutletWc <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
>
  extends _FeSequencerBaseOutletWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
{
  fePart = '_sequencer-grouped-outlet';

  declare protected readonly options: FeSequencerGroupedOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;
  declare protected templates: _Templates<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;
  declare protected readonly _argTemplates: typeof this.templates|undefined;

  // specific to FeGroupsScroller:
  // @TODO we can not store this in the viewmodel momentarily
  protected readonly virtualizerHostElRef = lit_createRef<VirtualizerHostElement>();
  protected virtualizerHostEl: VirtualizerHostElement|null = null;

  constructor(  // note that the order or parameters counts with ConstructorParameters used elsewhere
    strandvmRef?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>,
      //* strand/store ref can be provided directly, or alternatively via the context mechanism see contextObj in options
    options?: FeSequencerGroupedOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
    templates?: _Templates<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
  ) {
    super(
      strandvmRef,
      options,
      templates,
    );
  }

  // State:

  // View:

  protected _updateTemplateRefs () {
    // @ts-ignore @TODO
    this.templates = !this._argTemplates
      ? {
        group: this.strand?.templates?.group,
        child: this.strand?.templates?.cellWrapper,
      }
      : this._argTemplates;
    // in case the templates are provided by the strand's internal configuration
    // the templates remain undefined unless the context comes alive (and finalize reruns)
  }

  // Preps a group template for rendering within the flow:

  protected templatefromGroupshape: RenderItemFunction<TGroupShape> = (
    groupShape,
    inFlowIdx
  ): TemplateResult =>
    // this.strand and this.templates.group should be a valid object at this point within the main render
    when(groupShape,
      ()=> {
        // console.warn(this.logTag(),`/group CAAAAAAN render item: ${inFlowIdx}, group:`,groupShape);
        return html`<span>
          ${this.templates.group?.(
            groupShape,
            this.strand,
            this.templates.child,
            this.strand.vmiLabel + '_group_' + inFlowIdx,
            undefined,
          )}
        </span>`;
      },
      ()=> {
        console.warn(this.logTag(),`/group Couldn't render item: ${inFlowIdx}, item undefined`);
        return html`${nothing}`;
      },
    )
  ;

  // Rendering the groups:

  protected override render (): TemplateResult {
     // console.warn(`[${this.logTag}]: renders!!! ${_strand?.strandLabel} ::: ${_strand?.groupShapes?.size}`)

    // In the first stage we return nothing without a virtualizer frame
    // then even on errors we try to return nothing framed into a virtualizer so that the main reference works
    if (!this.strand?.isDefined) {
      console.warn(this.logTag(),`No group render possible: missing (not yet ready) strand (store ref or lit context)`);
      return html`${nothing}`;
    }
    if (!this.templates?.group) {
      console.warn(this.logTag(),`No group render possible: missing group item template`);  // @TODO the description
      return html`${nothing}`;
    }

    let renderingNothing: boolean = true;
    let groupItems: TGroupShape[] = [];
    try {
      if (!this.strand.groupShapes) {
        throw ('missing groups shapes');
      }
      groupItems = Array.from(this.strand.groupShapes?.values());
      if (!groupItems) {
        throw ('missing group shape .values');
      }

      const _compareFninSort = this.strand.actions.group?.compareFninSort;
      if (!!_compareFninSort) {
        groupItems?.sort(_compareFninSort === true ? undefined : _compareFninSort);
      }

      renderingNothing = false;

    } catch (err) {
      console.warn(this.logTag(),`No groups render possible:${err}`);
    }

    const groupsVirtualizer = !renderingNothing
      ?
        lit_virtualize<TGroupShape>({
          layout: lit_flow({
            ...this.options?.layout,
          }),
          scroller: this.options?.scrollerOff === undefined ? true : !this.options.scrollerOff,
          items: groupItems,
          renderItem: this.templatefromGroupshape
        })
      :
        null
    ;

    return html`
      <ul
        ${ref(this.virtualizerHostElRef)}
        @visibilityChanged=${this.#onVisibilityChanged}
        @onClick=${() => this.scrollToGroup(4) /* @TODO!!!! */}
        style=${styleMap({
          ...repeaterWrapperClasses.ulReset,
          ...(this.options?.layout?.styles || {})
        })}
      > 
        ${when(!renderingNothing,
          ()=> groupsVirtualizer,
          ()=> html`${nothing}`
        )}
      </ul>
    `;
  }

  /*protected override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (!this.strand?.isDefined) {
      console.warn(this.logTag('firstUpdated'),`Context/strand/store is not ready`);
      return;
    }
  }*/

  override #onVisibilityChanged (evt: any) {
    // console.log('group vis chaned:', evt);
  }

  scrollToGroup (idx: number) {
    // @ts-ignore @TODO
    (this.virtualizerHostEl?.[virtualizerRef]) // as DirectiveResult<typeof VirtualizeDirective>)
      .element(idx).scrollIntoView();
    // console.log('CLICKEEED') // @TODO !!!
  }
}
