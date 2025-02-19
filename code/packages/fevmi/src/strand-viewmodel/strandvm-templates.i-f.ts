import type {
  FeUsedbyappRenderResultT, NID,
} from '../_integration/default-typing-and-naming.js';
import type {
  _Fe_AnyI, IFeValue, IFeTriplet, FeShapesMap, IFeShape,
} from 'fe3';
import type { CFeStrandViewmodel } from './strand-viewmodel.js';


export type FeScrollerIndex = number | undefined; // Parameters<LitVirtualizer['scrollToIndex']>[0]|undefined

export type FeStrandVmSelfTemplate<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> = (
  strandvmRef?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>,
  cellTemplate?: FeInstrandCellTemplate<TValue, TShape, RenderResult>,
  cellWrapperTemplate?: FeInstrandCellWrapperTemplate<TValue, TShape, RenderResult>,
  groupTemplate?: FeInstrandGroupTemplate<TValue, TShape, TGroupShape, RenderResult>,
) => RenderResult;

export type FeGenericInstrandTemplatePrototype<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = (
  tripletOrShape: IFeTriplet<TValue, TShape> | TShape | undefined,
  childTemplate: FeGenericInstrandTemplatePrototype<TValue, TShape, RenderResult> | undefined,
  domKey?: string,
  // id?: NID, // if not present in the pyl, ie pyl is indeed raw
) => RenderResult;

export type FeGenericInstrandTemplate<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  ChildTemplate extends FeGenericInstrandTemplatePrototype<TValue, TShape, RenderResult> | undefined | any = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = (
  tripletOrShape: IFeTriplet<TValue, TShape> | TShape | undefined,
  childTemplate: ChildTemplate | undefined, //
  domKey?: string,
  ...args: any[]
  // id?: NID, // if not present in the pyl, ie pyl is indeed raw
) => RenderResult;
// eg. in sequencer it can be both cellWrapper or cellContent, in case only cellContent is defined then \
// it becomes its own wrapper with the child undefined

export type _TFeGroupShape<
  TGroupShape extends IFeShape = IFeShape<_Fe_AnyI>
> = IFeShape<TGroupShape>;  // @TODO !!!

export type FeInstrandGroupTemplate<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> = (
  groupShape: TGroupShape | undefined,
  strandvmRef?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>, // @TODO if bother with that it could also ve dig it for itself
  cellWrapperTemplate?: FeInstrandCellWrapperTemplate<TValue, TShape, RenderResult>,
  groupDomKey?: string,
  cellTemplate?: FeInstrandCellTemplate<TValue, TShape,RenderResult>,
  // context?: TFeManifestContextConsumer,
) => RenderResult;

export type FeInstrandCellWrapperTemplate<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = (
  tripletOrShape: IFeTriplet<TValue, TShape> | TShape | undefined,
  cellTemplate: FeInstrandCellTemplate<TValue, TShape, RenderResult>,
  domKey?: string,
  // id?: NID, // if not present in the pyl, ie pyl is indeed raw
) => RenderResult;

export type FeInstrandCellTemplate< // aka the Element Template
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = (
  tripletOrShape: IFeTriplet<TValue, TShape> | TShape | undefined,
  _?: undefined,  // this lets the cell and cellwraper template to have a same signature and the cell one be promoted as a wrapper
  domKey?: string,
  // id?: NID, // if not present in the pyl, ie pyl is indeed raw
) => RenderResult;


// export type OnAtomicClick = (id: AtomicItem['id'])=>void;
