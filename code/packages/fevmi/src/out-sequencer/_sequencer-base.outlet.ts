import {
  customElement, lit_html as html, lit_css as css, nothing, PropertyValues,
  lit_createRef, ref, LitElement, Lit_TemplateResult as TemplateResult,
  lit_virtualize, VirtualizerHostElement, virtualizerRef, Lit_Ref,
  Lit_BaseLayoutConfig, Lit_KeyFn, StyleInfo,
} from '../_shared/lit-imports.js';
import {
  IFeValue, IFeShape, IFeTriplet, FeTripletsArray,
  _feIsArray, _feDelay, _feIsObject, CFeStrand,
} from '../_shared/fe-imports.js';
import {
  FeUsedbyappRenderResultT, FeUsedbyappRefLIElementT, FeUsedbyappRefSpanElementT,
} from '../_shared/types.js';
import { nidGentr } from '../_shared/helpers.js';
import {
  CFeStrandViewmodel, FeGenericInstrandTemplate,
} from '../strand-viewmodel/index.js';
import {
  FeLayoutwStrandViewmodelWc, FeLayoutwStrandViewmodelConfig,
} from '../base/_layout-with-strandvm.js';
import {
  _VIRTUALIZER_NID_SIZE,
} from '../_shared/config.js';


type _ItemKeyFn <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
> = Exclude<FeSequencerBaseOutletConfig<TValue, TShape>['repeatKeyFn'], undefined>;
// * @TODO change return type to string
// * @TODO might deserve a helper function

export type _IFeShapewithFlowRefs <
  TValue extends IFeValue = IFeValue
> = IFeShape<TValue> & {
  refs: IFeShape<TValue>['refs'] & {
    selfRef?: FeUsedbyappRefLIElementT,
    childRef?: FeUsedbyappRefSpanElementT,
  }
}

export const repeaterWrapperClasses = {
  base: {
    height: '100%',
    minHeight: '100%',  // set the actual height of the fe-sequencer-outlet_ instead
    width: '100%',
    minWidth: '100%',
    overflow: 'auto', // cf. options.scroller if false
    // whiteSpace: 'nowrap',
    scrollbarColor: 'auto',
    scrollbarWidth: 'thin',
  } as StyleInfo,

  masonry: {
    overflow: 'unset',
  },

  horizontal: { // needed for the repeat-based case to mimic the virtualizer's function
    display: 'flex',
    flexDirection: 'row',
  } as StyleInfo,

  ulReset: {  // reset the wierd 'ul' defaults
    listStyleType: 'none',
    paddingInlineStart: '0',
    marginInlineStart: '0',
    marginInlineEnd: '0',
    marginBlockStart: '0',
    marginBlockEnd: '0',
  } as StyleInfo,  // @TODO + nowrap
};

export const cellWrapperWrapperClasses = {

  fullCell: {
    height: '100%',
    width: '100%',
    minWidth: '100%',
  } as StyleInfo,
};


export type FeSequencerBaseOutletConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> =
  FeLayoutwStrandViewmodelConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> &
  {
    layout?: Lit_BaseLayoutConfig,  // @TODO make this definition shared by flow and group
    scrollerOff?: boolean,
    flowbyRepeat?: boolean,
    repeatKeyFn?: Lit_KeyFn<IFeTriplet<TValue, TShape>>,
    pinOnRerenders?: 'end'|'start', // only works with lit virtualizer and utilizes its pin layout option, @TODO maybe
    cbs?: {
      onFirstUpdateOutro?: ()=> void,
    }
  };


type _Templates <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
> = {
};  // a stub for children


// An abstract class will never be instantiated so needs no customElements treatment
export abstract class _FeSequencerBaseOutletWc <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,  // @TODO might be changed to the above with FlowRefs
  TGroupShape extends IFeShape|undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
>
  extends FeLayoutwStrandViewmodelWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
{
  override fePart = '_sequencer-base-outlet';

  declare protected options: FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;
  protected templates!: _Templates<TValue,TShape>;
  protected _argTemplates: typeof this.templates|undefined = undefined;

  protected isRepeatBased!: boolean;
  protected virtualizerRefs = {} as typeof this.strand.refs.virtualizer;

  constructor(  // note that the order or parameters counts with ConstructorParameters used elsewhere
    strandvmRef?: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
    //* strand/store ref can be provided directly, or alternatively via the context mechanism see contextObj in options
    options?: FeSequencerBaseOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
    templates?: _Templates<TValue,TShape>,
  ) {
    super(
      strandvmRef,
      options,
    );

    // View:

    this._argTemplates = templates;
    this._updateTemplateRefs();

    this.isRepeatBased = !!this.options.flowbyRepeat;
    if (this.options.repeatKeyFn) {
      this.itemKeyFn = this.options.repeatKeyFn;
    }

    this.virtualizerRefs.id = this._vmiLabel + '_' + nidGentr(_VIRTUALIZER_NID_SIZE);
    this.virtualizerRefs.hostElRef = lit_createRef<VirtualizerHostElement>();
    this._updateVirtualizerRefs();
  }

  // State:

  public override get strand (): Exclude<typeof this._strand,undefined> {
    return this._strand;
  }
  public override set strand (
    strandvmRef: ConstructorParameters<typeof _FeSequencerBaseOutletWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>>[0],
  ) {
    super.strand = strandvmRef;
    this._updateTemplateRefs();

    if (this.strand.isDefined) {
      // this.strand.refs.virtualizer is defined by the strand viewmodel constructor but lets be on the overly safe side
      if (!this.strand.refs?.virtualizer) {
        this.strand.refs = {
          ...this.strand.refs,
          virtualizer: {} as typeof this.strand.refs.virtualizer
        }
      }
      this._updateVirtualizerRefs();
    }
  }

  protected itemKeyFn: _ItemKeyFn<TValue,TShape> =
    (triplet, _) =>
      this.strand.vmiLabel + '_' + (triplet.shape?.pylDigest || triplet.idx)
  ;
  // @TODO it may not have any pylDigest or that might not be unique
  // see also the constructor

  protected usefulItemsElRefs: {[key:string]: Lit_Ref<Element>|null} = {
    'start': null,
    'end': null,
  };

  // View:

  protected abstract _updateTemplateRefs (): void;

  protected _updateVirtualizerRefs () {
    if (_feIsObject(this.strand.refs?.virtualizer)) {
      this.strand.refs.virtualizer.id = this.virtualizerRefs?.id;
      this.strand.refs.virtualizer.hostElRef = this.virtualizerRefs?.hostElRef;
      this.strand.refs.virtualizer.hostEl = this.virtualizerRefs?.hostElRef?.value || null;
    }
  }

  public override updateTemplates (
    ...params: Parameters<CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['updateTemplates']>
  ) {
    super.updateTemplates(...params);
    this._updateTemplateRefs?.();
  }

  static styles = css`
  `;  // useless in open shadowroot cases so unused

  override connectedCallback () {
    super.connectedCallback();
    if (!this.strand?.isDefined) {
      console.warn(this.logTag('connectedCb'),`Context/strand/store is not ready`);
      return;
    }
    // console.log(this.logTag('connectedCb'),`Setting selfEl to ref`,this.strand.refs.virtualizer.hostElRef);
  }

  protected override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._updateVirtualizerRefs();

    // console.warn(this.logTag('firstUpdated'),this.strand.refs.virtualizerEl);
    if (_feIsObject(this.strand.actions)) {
      if (!this.strand.actions.self) {
        this.strand.actions.self = {};
      }
      this.strand.actions.self.scrollToCell = this._scrollIntoView;
      this.strand.actions.self.scrollStartIntoView = this._scrollStartIntoView;
      this.strand.actions.self.scrollEndIntoView = this._scrollEndIntoView;
    } else {
      console.warn(this.logTag('firstUpdated'),`Actions object is undefined at this point which means this sequencer's initialization failure.`);
    }

    if (!this.isRepeatBased) {
      if (!this.strand.refs.virtualizer.hostEl?.[virtualizerRef]?.['element']) {
        console.warn(this.logTag(),`Virtualizer element's ref is not present or its host element is not found in document`, this.strand.refs.virtualizer.hostElRef, this.strand.refs.virtualizer.hostEl);
      } /*else {
        console.warn(this.logTag(),`Virtualizer elementTTTTT`, this.strand.refs.virtualizer.hostEl);
      }*/
    } else {
      if (this.options.pinOnRerenders) {  // @TODO this actually should be part of re-render
        // console.warn(this.logTag(),`pinOnRerenders won't work with flowbyRepeat`);
        if (this.options.pinOnRerenders === 'start') {
          this._scrollStartIntoView();
        }
        if (this.options.pinOnRerenders === 'end') {
          this._scrollEndIntoView();
        }
      }
    }

    // this.options.cbs?.onFirstUpdateOutro?.(); -- let it happen on the first not abstract level child
  }

  override #onVisibilityChanged (evt: any) {
  }

  protected _scrollStartIntoView = (scrollOptions?: ScrollIntoViewOptions) =>
    this.usefulItemsElRefs['start']?.value?.scrollIntoView(scrollOptions);

  protected _scrollEndIntoView = (scrollOptions?: ScrollIntoViewOptions) =>
    this.usefulItemsElRefs['end']?.value?.scrollIntoView(scrollOptions);


  protected _scrollIntoView (  // Does not rely on this, but the original / persisting this.context consumer
    id: Parameters<CFeStrand<TValue, TShape>['getShapesEntry']>[0], // @TODO scrollToCell may have this same signature
    scrollOptions?: ScrollIntoViewOptions,
  ) {
    // this.scrollIntoView(positionOrOptions);  @TODO check the Spectrum virtualizer
    if (id === undefined || id === null) {
      console.log(this.logTag(),`Scrolling to an undefined/null key requested`);
      return false;
    }
    const shape = this.strand?.getShapesEntry(id) as _IFeShapewithFlowRefs<TValue>;
    if (!this.strand?.isDefined || !shape) {
      console.log(this.logTag(),`Is not yet ready for scrolling to an item or ${id} does not exist`,this.strand.shapes,this.strand.values);
      return false;
    }

    if (!this.isRepeatBased) {  // actual child might not implement this or that
      const inFlowIdx = shape.idxs?.inFlow;
      if (inFlowIdx === undefined) {
        console.log(this.logTag(),`Scrolling index ${id} does not exist`,shape);
        return false;
      }
      this.strand.refs?.virtualizer?.hostEl?.[virtualizerRef]?.
      element(inFlowIdx)?.scrollIntoView(scrollOptions);
      console.log(this.logTag(),`Scrolling index ${id} by element proxy`);

    } else {  // flowbyRepeat

      const selfEl = shape.refs?.selfRef?.value;
      if (selfEl) {
        selfEl.scrollIntoView(scrollOptions);
        console.log(this.logTag(),`Scrolling index ${id} by native api`);
      }
    }
    return true;
  }
}