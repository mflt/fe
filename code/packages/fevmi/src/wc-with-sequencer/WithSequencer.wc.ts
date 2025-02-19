import {
  customElement, lit_html as html, Lit_TemplateResult as TemplateResult,
} from '../_shared/lit-imports.js';
import type {
  IFeValue, IFeShape, FeShapePartfromTripletGentr, _Fe_AnyI,
} from '../_shared/fe-imports.js';
import type {
  FeUsedbyappRenderResultT
} from '../_shared/types.js';
import {
  CFeStrandViewmodel, FeStrandViewmodelConfig, ComposeStrandVmClassBase,
} from "../strand-viewmodel/index.js";
import {
  FeLayoutwStrandViewmodelWc, FeLayoutwStrandViewmodelConfig
} from '../base/_layout-with-strandvm.js';
import {
  FeSequencerOutletWc, FeSequencerOutletConfig,
} from '../out-sequencer/sequencer.outlet.js';
import {
  FeSequencerGroupedOutletWc, FeSequencerGroupedOutletConfig,
} from '../out-sequencer/sequencer-grouped.outlet.js';


export type FeWithSequencerConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  TStoreClassAndOtherMergedInterfaces extends {} = {}, // @TODO store type
  RenderResult extends {} = FeUsedbyappRenderResultT, // @TODO
  IHostOrCustomActions extends {} = {}
> =
  FeLayoutwStrandViewmodelConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> &
  {
    strandConfig?: Partial<FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>,
    sequencerConfig?: {
      variant?: 'normal'|'grouped',
      options?:
        FeSequencerOutletConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions> |
        FeSequencerGroupedOutletConfig<TValue, TShape, Exclude<TGroupShape, undefined>, RenderResult, IHostOrCustomActions>,
      templates?:
        ConstructorParameters<typeof FeSequencerOutletWc<TValue, TShape>>[2] |
        ConstructorParameters<typeof FeSequencerGroupedOutletWc<TValue, TShape, Exclude<TGroupShape, undefined>>>[2],
    }
    layout?: {

    }
  };

declare global {
  interface HTMLElementTagNameMap {
    'fe-with-sequencer': FeWithSequencerWc<{},{},{}>,
  }
}
@customElement('fe-with-sequencer')
export class FeWithSequencerWc < // short for FeSequenceInGridWc
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  TStoreClassAndOtherMergedInterfaces extends {} = {}, // @TODO store type
  RenderResult extends {} = FeUsedbyappRenderResultT, // @TODO
  IHostOrCustomActions extends {} = {}
>
  extends FeLayoutwStrandViewmodelWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
{
  fePart = 'with-sequencer';

  declare protected options: FeWithSequencerConfig<TValue,TShape,TGroupShape,TStoreClassAndOtherMergedInterfaces,RenderResult,IHostOrCustomActions>;

  public outlet!:
    FeSequencerOutletWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> |
    FeSequencerGroupedOutletWc<TValue,TShape,Exclude<TGroupShape,undefined>,RenderResult,IHostOrCustomActions>;
  protected _variant!: Exclude<FeWithSequencerConfig<TValue,TShape>['sequencerConfig'],undefined>['variant'];

  constructor(
    options: FeWithSequencerConfig<TValue,TShape,TGroupShape,TStoreClassAndOtherMergedInterfaces,RenderResult,IHostOrCustomActions>,
    valuesRefOrFn:
      (CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_values']) | undefined,
    shapesRefOrFn:
      (CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_shapes']
        | FeShapePartfromTripletGentr<TValue, TShape>) | undefined,
    groupShapesRefOrFn:
      CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_groupShapes']
      | FeShapePartfromTripletGentr<_Fe_AnyI, IFeShape<_Fe_AnyI>>, // @TODO
    storeAndOtherMergedInterfaces?: {}[],
  ) {
    super(
      true, // isPromised, see below
      {...options, }
    );  // we don't deal with the case of context, may plan to deal

    const _StrandVmiWithStoreConstructor = ComposeStrandVmClassBase<TValue,TShape,TGroupShape,TStoreClassAndOtherMergedInterfaces,RenderResult,IHostOrCustomActions>(
      valuesRefOrFn,
      shapesRefOrFn,
      // @ts-ignore @TODO
      this.options.strandConfig,
      groupShapesRefOrFn,
      storeAndOtherMergedInterfaces,
    );

    // @ts-ignore @TODO
    this.strand = new class extends _StrandVmiWithStoreConstructor {
      constructor() {
        super();
        // this.templates = {};
        // this.actions = {};
        // update templates and actions
      }
    };

    this._variant = this.options.sequencerConfig?.variant || 'normal';

    this.outlet = !(this._variant === 'grouped')
      ?
      new FeSequencerOutletWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>(
        this.strand,
        this.options.sequencerConfig?.options as FeSequencerOutletConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
      )
      :
      new FeSequencerGroupedOutletWc<TValue,TShape,Exclude<TGroupShape,undefined>,RenderResult,IHostOrCustomActions>(
        // @ts-ignore @TODO
        this.strand as CFeStrandViewmodel<TValue,TShape,Exclude<TGroupShape,undefined>,RenderResult,IHostOrCustomActions>,
        this.options.sequencerConfig?.options as FeSequencerGroupedOutletConfig<TValue,TShape,Exclude<TGroupShape,undefined>,RenderResult,IHostOrCustomActions>,
      )
    ;

  }

  // State:

  public override pushBeat (
    suppressPushingBeatinStrands?: boolean, // @TODO, if those have to be separated
  ) {
    super._pushOnlyBeat(suppressPushingBeatinStrands);
    return this.outlet?.pushBeat(suppressPushingBeatinStrands);
  }

  public override announceContextRefresh: CFeStrandViewmodel<TValue,TShape>['announceContextRefresh'] = () => {
    super._pushOnlyBeat(false);
    this.outlet?.announceContextRefresh();
  }

  public override appendEntry: CFeStrandViewmodel<TValue,TShape>['appendEntry'] = (...params) => {
    super._pushOnlyBeat(false);
    return this.outlet?.appendEntry(...params);
  }

  public prependEntry: CFeStrandViewmodel<TValue,TShape>['prependEntry'] = (...params) => {
    super._pushOnlyBeat(false);
    return this.outlet?.prependEntry(...params);
  }

  // View:

  public override updateTemplates (
    ...params: Parameters<CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['updateTemplates']>
  ) {
    return this.outlet?.updateTemplates(
      // @ts-ignore @TODO
      ...params
    );
  }
    // strand getter operates on the same _strand ref in both this and the child sequencerEl instance,
    // but in _FeSequencerBaseLoWc it also does _updateTemplateRefs

  public updateActions: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['updateActions'] =
    (...params) => this.outlet?.updateActions(...params);

  protected override render(): TemplateResult {
    return html`
      ${this.outlet}
    `;
  }

}