import {
  feViewsIngressDefaults, FeUsedbyappRenderResultT, FeUsedbyappRenderItemFunctionT
} from '../_integration/default-typing-and-naming.js';
import type {
  _Fe_AnyI, IFeValue, _Fe_GConstructor,
  IFeShape, IFeTriplet, FeShapePartfromTripletGentr,
} from 'fe3';
import { applyMixins, } from 'fe3/utils';
import {
  type FeStrandConfig, emptyFeStrandConfig,
} from 'festrand/strand';
import type {
  _TFeGroupShape, FeInstrandCellTemplate, FeInstrandCellWrapperTemplate, FeInstrandGroupTemplate, FeStrandVmSelfTemplate,
} from './strandvm-templates.i-f.js';
import type {
  IFeCellActions, IFeGroupActions, IFeStrandVmSelfActions,
} from './strandvm-actions.i-f.js';
import { CFeStrandViewmodel, } from './strand-viewmodel.js';


// @TODO reorganize from templats/actions to group/cell/etc
export type FeStrandViewmodelConfig<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> = {
  options: FeStrandConfig<TValue, TShape>['options'] & {
    vmiLabel?: string, // defaults to 'myStrand' @TODO
    // groupsStrandName?: string, // @TODO
    customActions?: IHostOrCustomActions,
    host?: IHostOrCustomActions,  // @TODO not implemented yet / it was
    preInit?: (self?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>)
      => void;  // strand constructor starts with
    postInit?: (self?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>)
      => void;  // strand constructor ends with
  },
  helpers: FeStrandConfig<TValue, TShape>['helpers'] & {}, // @TODO
  templates: {  // @TODO to view
    // @TODO review if type of renderNothing is needed at all
    self: FeStrandVmSelfTemplate<TValue, TShape, TGroupShape, RenderResult> | typeof feViewsIngressDefaults.renderNothing, // defined by default by constructor as {}
    group?: FeInstrandGroupTemplate<TValue, TShape, TGroupShape, RenderResult> | typeof feViewsIngressDefaults.renderNothing, // -"-
    cellWrapper?: FeInstrandCellWrapperTemplate<TValue, TShape, RenderResult> | typeof feViewsIngressDefaults.renderNothing, // -"-
    cellContent?: FeInstrandCellTemplate<TValue, TShape, RenderResult> | typeof feViewsIngressDefaults.renderNothing, // -"-
    renderItem?: FeUsedbyappRenderItemFunctionT<IFeTriplet<TValue, TShape>> | FeUsedbyappRenderItemFunctionT<TShape>, // -"-
  },
  //* model goes to values
  actions: {
    // model:
    // findItemPyl?: FeFindInPylsFn<TValue>, // handles more cases than getItemPyl
    // toShape
    // groupItems?: (fn: Parameters<Array<TValue>['filter']>[0]) => FeItemsArray<TValue,TShape>
    // view
    self: IFeStrandVmSelfActions<TValue, TShape, TGroupShape, RenderResult>, // defined by default by constructor as {}
    group?: IFeGroupActions<TValue, TShape, TGroupShape, RenderResult>, // group aka cellGroup  // -"-
    cell?: IFeCellActions<TValue, TShape, RenderResult>, // -"-
  },
};

export const emptyFeStrandVmConfig = {
  options: {
    ...emptyFeStrandConfig.options,
    vmiLabel: feViewsIngressDefaults.strandLabel,
    // groupedStrandName: frankieDefaults.groupedStrandName,
  },
  templates: {},
  actions: {},
} as Required<FeStrandViewmodelConfig<_Fe_AnyI, IFeShape<_Fe_AnyI>, _TFeGroupShape, FeUsedbyappRenderResultT, {}>>; // @TODO typing


export function ComposeStrandVmClassBase <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  TStoreClassAndOtherMergedInterfaces extends {} = {}, // @TODO store type, see FuFragment's class typing
  RenderResult extends {} = FeUsedbyappRenderResultT, // @TODO
  IHostOrCustomActions extends {} = {}
>(
  valuesRefOrFn:
    (CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_values']) | undefined,
  shapesRefOrFn:
    (CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_shapes']
      | FeShapePartfromTripletGentr<TValue, TShape>) | undefined,
  config: Partial<FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>,
  groupShapesRefOrFn:
    CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_groupShapes']
    | FeShapePartfromTripletGentr<_Fe_AnyI, IFeShape<_Fe_AnyI>>, // @TODO
  storeAndOtherMergedInterfaces?: {}[]
)
  /*:
  _Fe_GConstructor<
    CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions> &
    TStoreClassAndOtherMergedInterfaces // @TODO what about the array of in-mixed classes
  >*/
{

  class BaseforDerivedfromStrandClasswithStoreAndOthers
    extends CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>
  {
    constructor() {
      super(
        config,
        valuesRefOrFn,
        shapesRefOrFn,
        groupShapesRefOrFn,
      );
    }
  }
  // @ts-ignore
  interface BaseforDerivedfromStrandClasswithStoreAndOthers extends TStoreClassAndOtherMergedInterfaces { }
  applyMixins(
    BaseforDerivedfromStrandClasswithStoreAndOthers,
    storeAndOtherMergedInterfaces || []
  );
  type ReturnT = _Fe_GConstructor<
    & CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>
    & TStoreClassAndOtherMergedInterfaces
  >;
  return BaseforDerivedfromStrandClasswithStoreAndOthers as unknown as ReturnT;
}


/*
export type IFeContextofStrandViewmodel<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult = TFeManifestRenderResult, // @TODO
  // MergedInterface extends {} = {},
  IHostOrCustomActions extends {} = {},
> = {
  strandvmRef: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>,
}
  & IFeReactiveBeat<number> // @TODO mind that a beat is already in the strand as well
  ;
*/
