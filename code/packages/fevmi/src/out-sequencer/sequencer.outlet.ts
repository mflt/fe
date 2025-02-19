import {
  Context, state, customElement, lit_html as html, lit_css as css, nothing, PropertyValues, RenderItemFunction, query,
  lit_createRef, ref, LitElement, Lit_TemplateResult as TemplateResult,
  lit_virtualize, VirtualizerHostElement, virtualizerRef, Lit_Ref,
  lit_flow, Lit_BaseLayoutConfig, lit_masonry, MasonryLayoutConfig,
  ifDefined, repeat, Lit_KeyFn, StyleInfo, styleMap, classMap, when,
} from '../_shared/lit-imports.js';
import {
  IFeValue, IFeShape, IFeTriplet, FeTripletsArray,
  _feIsArray, _feDelay, _feIsObject, CFeStrand,
} from '../_shared/fe-imports.js';
import {
  FeUsedbyappRenderResultT, FeUsedbyappRefLIElementT, FeUsedbyappRefSpanElementT,
} from '../_shared/types.js';
import {
  CFeStrandViewmodel, FeGenericInstrandTemplate,
} from '../strand-viewmodel/index.js';
import {
  _FeSequencerBaseOutletWc, FeSequencerBaseOutletConfig, _IFeShapewithFlowRefs,
  repeaterWrapperClasses, cellWrapperWrapperClasses
} from './_sequencer-base.outlet.js';
import {
  _AFTER_RERENDER_DELAY,
} from '../_shared/config.js';


export type FeSequencerOutletConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> =
  FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> &
  {
    layoutMethod?: 'flow'|'grid'|'masonry',
    layout?: FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['layout'] & {
      fullCell?: boolean,
      repeaterWrapperStyles?: Readonly<StyleInfo>,
      cellWrapperWrapperStyles?: Readonly<StyleInfo>,
    },  // @TODO make this definition shared by flow and group
    masonryLayout?: MasonryLayoutConfig,
  };


type _Templates <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
> = {
  self: FeGenericInstrandTemplate<TValue, TShape,_Templates<TValue, TShape> extends { child: infer Child } ? Child : any>,
    //* normally the cellWrapper template or if child is not defined then cellContent
  child: FeGenericInstrandTemplate<TValue,TShape,any|undefined>|undefined,
    //* normally cellContent if self (that is the wrapper) is defined
}  // see the comment to FeGenericInstrandTemplate


declare global {
  interface HTMLElementTagNameMap {
    'fe-sequencer-outlet_': FeSequencerOutletWc<{},{}>,
  }
}
// Also updates the shapes' 'refs' part according to the situation to reflect the render time values.
@customElement('fe-sequencer-outlet_')
export class FeSequencerOutletWc <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,  // @TODO might be changed to the above with FlowRefs
  TGroupShape extends IFeShape|undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
>
  extends _FeSequencerBaseOutletWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
{
  override fePart = '_sequencer-outlet';

  declare protected readonly options: FeSequencerOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;
  declare protected templates: _Templates<TValue,TShape>;
  declare protected readonly _argTemplates: typeof this.templates|undefined;

  // specific to FeSequencer:
  protected readonly recentItems!: FeTripletsArray<TValue,TShape>;  // refilled on each render
  protected readonly isMasonry!: boolean;  // @TODO could also be public by getter

  constructor(  // note that the order or parameters counts with ConstructorParameters used elsewhere
    strandvmRef?: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
      //* strand/store ref can be provided directly, or alternatively via the context mechanism see contextObj in options
    options?: FeSequencerOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
    templates?: _Templates<TValue,TShape>,
    // specific to FeSequencer:
    recentItemsRefforCaller?: FeTripletsArray<TValue,TShape>,
      // * this one does not deliver involved triplets to render but allows returning them to the caller,
      // - undefined indicates that the caller is disinterested in tracking the values
  ) {
    super(
      strandvmRef,
      options,
      templates,
    );

    // State:
    this.recentItems = _feIsArray(recentItemsRefforCaller)
      ? recentItemsRefforCaller
      : new Array<(IFeTriplet<TValue, TShape>)>
    ;

    // View:
    this.isMasonry = this.options.layoutMethod === 'masonry';
  }

  // State:

  // View:

  protected _updateTemplateRefs () {
    this.templates = !this._argTemplates
      ? {
        self: (this.strand.templates?.cellWrapper || this.strand.templates?.cellContent) as
          Exclude<(typeof this.templates) extends { self: infer Self } ? Self : any, undefined>,
        child: this.strand.templates?.cellWrapper
          ? this.strand.templates?.cellContent as
            Exclude<(typeof this.templates) extends { child: infer Child } ? Child : any, undefined>
          : undefined
        ,
      }
      : this._argTemplates;
    // in case the templates are provided by the strand's internal configuration
    // the templates remain undefined unless the context comes alive (and finalize reruns)
  }

  // Preps a cell for rendering within the flow:

  protected templatefromTriplet: RenderItemFunction<IFeTriplet<TValue, TShape>> = (
    triplet,
    inFlowIdx
  ): TemplateResult => {
    // this.strand and this.templates.self should be a valid object at this point within the main render
    if (!triplet) {
      console.warn(this.logTag(),`Couldn't render item with an in-flow index: ${inFlowIdx}`);
      return html`${nothing}`;
    }
    const itemElRef = lit_createRef();
    if (!this.usefulItemsElRefs['start']) {
      this.usefulItemsElRefs['start'] = itemElRef;
    }
    this.usefulItemsElRefs['end'] = itemElRef;
    this.strand.setShapesEntry({
      value: triplet.value,
      // @ts-ignore
      shape: {
        ...triplet.shape,
        refs: {
          ...triplet.shape?.refs,
          selfRef: itemElRef,
          childRef: undefined,  // @TODO is it?
        },
        idxs: {
          ...triplet.shape?.idxs,
          inFlow: inFlowIdx,
        }
      },
      idx: triplet.idx,  // @TODO review, the index set by populateArray must return
    });
    // console.log(`[${this.strand.s.options.strandName}] sequencing item: ${itemKeyFn(triplet, inFlowIdx) as string} / ${triplet.shape?.valueBasedKey}`)
    // console.log("FLOW item", this.logTag(), this.options.layout?.fullCell, triplet.value);

    return html`
        <div 
            ${ref(itemElRef)} 
            class="cell-wrapper-wrapper"
            style=${styleMap({
              ...(this.options.layout?.fullCell? cellWrapperWrapperClasses.fullCell :{}),
              ...this.options.layout?.cellWrapperWrapperStyles,
            })} 
        >
          ${this.templates.self?.(
            triplet,
            this.templates.child,
            this.itemKeyFn(triplet, inFlowIdx) as string /* idx */
          )}
        </div>
      `;  // see the comment to FeGenericInstrandTemplate
  }

  // Rendering the flow:

  protected override render (): TemplateResult {

    this.usefulItemsElRefs['start'] = null;
    this.usefulItemsElRefs['end'] = null; // @TODO make it iterable

    // In the first stage we return nothing without a virtualizer frame
    // then even on errors we try to return nothing framed into a virtualizer so that the main reference works
    if (!this.strand?.isDefined) {
      console.warn(this.logTag(),`No flow render possible: missing (not yet ready) strand (store ref or lit context)`);
      return html`${nothing}`;
    }
    if (!this.templates?.self) {
      console.warn(this.logTag(),`No flow render possible: missing flow item (cell) template (cellWrapper)`);
      return html`${nothing}`;
    }
    // console.warn(`${this.logTag}: ${!(this.strand.templates.cellWrapper)},${!this.strand.templates.cellContent}`)

    const items = this.strand.populate3Arr(
      this.recentItems, {
        doesEntryFit: this.options.doesEntryFit,
        groups: this.options.groups,
        compareFninSort: this.options.compareFninSort,
      }
    ) || [];  // false is converted to a zero length array which is checked below

    // console.warn(`${this.logTag}: renders`,this.options.groups)

    const renderingNothing = !items?.length;  // the virtualizer frame still will render and so create the referenced element
    if (!renderingNothing) {

      this.postRender();  // post meaning that it is supposed to be a delayed execution thing adding to the lifecycle
    } else {
      console.warn(this.logTag(),`No items to render`,this.options.groups);
    }

    const sequenceVirtualizer = !renderingNothing && !this.isRepeatBased
      ?
        lit_virtualize<IFeTriplet<TValue,TShape>>({
          layout: !this.isMasonry
            ?
            lit_flow({
              ...(
                this.options.pinOnRerenders === 'end' ? { pin: { index: items.length - 1, block: 'end' } }
                  : this.options.pinOnRerenders === 'start' ? { pin: { index: 0, block: 'start' } }
                    : {}
              ),
              ...this.options.layout,
            })
            :
            lit_masonry({
              ...(this.options.masonryLayout || {} as MasonryLayoutConfig), // @TODO some fallback defaults maybe
            })
          ,
          scroller: this.options.scrollerOff === undefined ? true : !this.options.scrollerOff,
          items,
          renderItem: this.templatefromTriplet,
        })
      :
        null
    ;

    return html`
      <ul
          ${ref(this.strand.refs.virtualizer?.hostElRef)}
          id=${this.strand.refs.virtualizer?.id}
          style=${styleMap({
            ...repeaterWrapperClasses.ulReset,
            ...repeaterWrapperClasses.base,
            ...(this.isMasonry? repeaterWrapperClasses.masonry : {}),
            ...(this.options.layout?.direction==='horizontal'? repeaterWrapperClasses.horizontal: {}),
            ...this.options.layout?.repeaterWrapperStyles,
          })}
      > 
        ${when(!renderingNothing,
          ()=> 
            when<boolean,ReturnType<typeof lit_virtualize>,unknown>(
              !this.isRepeatBased,
              ()=> sequenceVirtualizer!,
              ()=> repeat(
                items,
                this.itemKeyFn,
                this.templatefromTriplet
              )
            ),
          ()=> html`${nothing}`
        )}
      </ul>
    `;
    // @TODO implement adding inline-display in case of horizontal flow
  }

  protected postRender () {
    (async function (that: FeSequencerOutletWc<TValue,TShape>){
      await that.updateComplete;
      await _feDelay(_AFTER_RERENDER_DELAY);
      if (that.options.pinOnRerenders === 'start') {
        that._scrollStartIntoView();
      }
      if (that.options.pinOnRerenders === 'end') {
        that._scrollEndIntoView();
      }
    })(
      // @ts-ignore
      this
    );
  }

  protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (!this.strand?.isDefined) {
      return;
    }

    this.options.cbs?.onFirstUpdateOutro?.();
  }
}

type a = ReturnType<typeof lit_virtualize>
