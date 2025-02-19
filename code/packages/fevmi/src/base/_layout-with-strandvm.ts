import {
  Context, LitElement, state, PropertyValues, Lit_TemplateResult as TemplateResult
} from '../_shared/lit-imports.js';
import {
  IFeValue, IFeShape, FePopulate3ArrParams, _feIsObject,
} from '../_shared/fe-imports.js';
import type {
  FeUsedbyappRenderResultT, FeElementProps, FeLayoutAndViewmodelConfigBase,
} from '../_shared/types.js';
import { nidGentr } from '../_shared/helpers.js';
import { altSubscribetoContext, } from '../utils/utils.js';
import { CFeStrandViewmodel, } from '../strand-viewmodel/index.js';
import { FeElementBaseWc, } from './_element-base.js';


export type FeLayoutwStrandViewmodelConfig <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape|undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> = FeLayoutAndViewmodelConfigBase & {
  contextObj?:
    Context<unknown, CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>
      // true _strandvmRef is used in altSubscribetoContext to indicate that strandvmRef will be defined later and creating context is to be skipped
  ,
    //* ref of strand vm and its beat if context mechanism is used upstream
  vmiLabel?: string,
  layout?: {
  }
  doesEntryFit?: FePopulate3ArrParams<TValue, TShape>['doesEntryFit'],
  groups?: FePopulate3ArrParams<TValue, TShape>['groups'],
  compareFninSort?: FePopulate3ArrParams<TValue, TShape>['compareFninSort'],
  tuning?: {
    forceRequestViewUpdate?: {
      onPushBeat?: boolean, // which will happen eg. on appending or prepending an entry
      onAnnounceContextRefresh?: boolean, // announceContextRefresh is to enforce viewmodel update cycle
    }
  },
  // cbs?: {} in Base
};


export abstract class FeLayoutwStrandViewmodelWc <  // not the with
  TValue extends IFeValue,
  TShape extends IFeShape<TValue>,
  TGroupShape extends IFeShape|undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
>
  extends FeElementBaseWc<RenderResult>
{
  fePart = '_fe-layout-w-strandvm';
  protected override logTag = (sub?: string) =>'[' + this.fePart + '/' + (this.strand?.vmiLabel || '*missing viewmodel label*') + (sub? '/' + sub : '') + ']:';

  protected _strand!: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;
  protected context: ReturnType<typeof altSubscribetoContext<
    CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
  >> = undefined; // it actually is the alternative source of strand vm

  declare protected readonly options: FeLayoutwStrandViewmodelConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>;

  protected readonly _vmiLabel!: FeLayoutwStrandViewmodelConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['vmiLabel'];

  constructor(  // @TODO the grid's args vs members pattern is to implement
    strandvmRef?: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions> | true,
    //* strand/store ref can be provided directly, or alternatively via the context mechanism see contextObj in options
    options?: FeLayoutwStrandViewmodelConfig<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>,
  ) {
    super(options);

    // State:
    this._vmiLabel = this.options.vmiLabel || (this.fePart + '_' + nidGentr());
    this.strand = strandvmRef;
    // this._strand defined at this point: or ref was provided, or its waiting for the context or isPromised, and eqs the initFlags stub
    this.context = altSubscribetoContext<
      CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>
    >(this, strandvmRef, this.options.contextObj,
      /* onContextRequestSatisfied */ () => {
        this.strand = this.context?.value; // assigning undefined would result in the same assignment
          // this time the context.value must be delivering the right strand ref
          // @TODO which one is finally called/first, this as super or the child's one which then calls the below code
      }
    ); // note it does not call pushBeat itself, like the upstream slices-scroller does

    this._beat = this.strand.beat || 0;
  }
  // note that between the run of constructor and the second _strand assignment triggered by context/onContextRequestSatisfied
  // the context.value is undefined
  // also there is a scenario tht this.strand is promised to be defined soon but still later,
  // so this._strand is in fact undefined (isDefined), which may result in a broken run or initialization.

  // State:

  public get strand (): Exclude<typeof this._strand,undefined> {
    return this._strand;
  }
  public set strand (
    strandvmRef: ConstructorParameters<typeof FeLayoutwStrandViewmodelWc<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>>[0],
  ) {
    const initFlags: { isDefined?: boolean, isPromised?: boolean, } = {};
    initFlags.isPromised = strandvmRef === true;
    this._strand = (initFlags.isPromised? undefined :( strandvmRef || this.context?.value)) as typeof this._strand;
    initFlags.isDefined = _feIsObject(this._strand); // is false if isPromised was true, or both sources were undefined
    if (!initFlags.isDefined) {
      this._strand = initFlags as typeof this._strand;
    } else {
      this._strand.isDefined = true;
      this._strand.isPromised = false;
    }
    this._strand.vmiLabel = this._vmiLabel;
    // @TODO why were strand member functions partially being cut off by spreading this._strand
  }

  @state()
  protected _beat = 0;  // @TODO public probably?
  protected _pushOnlyBeat (
    suppressPushingBeatinStrand?: boolean,
  ) {
    this._beat = (!suppressPushingBeatinStrand ? this.strand?.pushBeat?.() : this.strand?.beat) || this._beat + 1;
  }
  public pushBeat (
    suppressPushingBeatinStrand?: boolean,
  ) {
    this._pushOnlyBeat(suppressPushingBeatinStrand);
    if (this.options?.tuning?.forceRequestViewUpdate?.onPushBeat) {
      this.requestUpdate(); // @TODO if the reactive state update does not work since in package
    }
    return this._beat;
  }

  public announceContextRefresh: CFeStrandViewmodel<TValue,TShape>['announceContextRefresh'] = () => {
    this.strand.announceContextRefresh?.();
    this.pushBeat(false);
    if (this.options?.tuning?.forceRequestViewUpdate?.onAnnounceContextRefresh) {
      this.requestUpdate();
    }
  }

  public appendEntry: CFeStrandViewmodel<TValue,TShape>['appendEntry'] = (...params) => {
    const superRes = this.strand.appendEntry?.(...params);
    this.pushBeat(false);
    return superRes;
  }

  public prependEntry: CFeStrandViewmodel<TValue,TShape>['prependEntry'] = (...params) => {
    const superRes = this.strand.prependEntry?.(...params);
    this.pushBeat(false);
    return superRes;
  }

  // View:

  public updateTemplates (
    ...params: Parameters<CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['updateTemplates']>
  ) {
    return this.strand.updateTemplates?.(...params);
  };

  public updateActions: CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>['updateActions'] =
    (...params) => this.strand.updateActions?.(...params);

  protected abstract override render (): TemplateResult;  // just to justify that we have an abstract class to concretize :)

  protected override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (!this.strand?.isDefined) {
      console.warn(this.logTag('firstUpdated'),`Context/strand/store is not ready`);
      return;
    }

  }

}