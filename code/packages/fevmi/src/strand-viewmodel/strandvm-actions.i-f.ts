import type {
  FeUsedbyappRenderResultT, NID,
} from '../_integration/default-typing-and-naming.js';
import type {
  FeGroupIdsfromTripletGentr, IFeShape, IFeTriplet, IFeValue,
} from 'fe3';
import {
  feGetCollectionEntry,
} from 'fe3/utils';
import {
  CFeStrand
} from 'festrand/strand';
import type { FeScrollerIndex, } from './strandvm-templates.i-f.js';


export type IFeStrandVmSelfActions<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = {
  // cellTemplate?: FeCellTemplate,  // ?
  onViewUpdate?: (idx: number) => [],  // ?
  requestViewUpdate?: FeRequestSelfViewUpdate, // ?
  addEventListener?: (  // ?
    type: Parameters<HTMLElement['addEventListener']>[0],
    listener: Parameters<HTMLElement['addEventListener']>[1],
    options: Parameters<HTMLElement['addEventListener']>[2],
  ) => void,
  /* addCellEventListener?: (  // ?
    id: __IFeCustomCell['id'],
    type: Parameters<HTMLElement['addEventListener']>[0],
    listener: Parameters<HTMLElement['addEventListener']>[1],
    options: Parameters<HTMLElement['addEventListener']>[2],
  ) => void, */
  onMount?: () => void,
  append?: (
    triplet: IFeTriplet<TValue, TShape>,
    // shape: CFeItem<TValue, TShape> | undefined,
    // id?: NID, // if not present in the pyl, ie pyl is indeed raw
    appendValue?: Parameters<CFeStrand<TValue,TShape>['appendEntry']>[1],
  ) => FeScrollerIndex;
  scrollToCell?: (
    id: Parameters<typeof feGetCollectionEntry<TShape>>[1],
    scrollOptions?: ScrollIntoViewOptions
  ) => boolean,
  scrollStartIntoView?: (scrollOptions?: ScrollIntoViewOptions) => void,
  scrollEndIntoView?: (scrollOptions?: ScrollIntoViewOptions) => void,
  scrollToGroup?: (id: NID, position?: ScrollIntoViewOptions) => boolean,  // @TODO position
};

export type IFeCellActions <  // the signature is not strand vm specific, so the name is general
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = {
  update?: () => boolean,
  // requestViewUpdate?: FeRequestItemViewUpdate,  // ?
  scrollIntoView?: (
    position?: ScrollIntoViewOptions
  ) => boolean,
};

export type IFeGroupActions < // the signature is not strand vm specific, so the name is general
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
> = IFeCellActions<TValue, TShape> & {
  getGroupTriplets?: (
    groupId: NID,
    ...rest: any[]
  ) => IFeTriplet<TValue, TShape>[],
  groupIdsfrom3?: FeGroupIdsfromTripletGentr<TValue, TShape>,  // not implemented
  compareFninSort?: (Parameters<Array<TGroupShape>['sort']>[0]) | true  // @TODO
  // * true means using Array.sort w/o a specific compare fn.
}; // @TODO

export type RequestDefaultSelfViewUpdate = () => void; // @TODO ?

export type FeRequestSelfViewUpdate = () => void;

// export type FeRequestItemViewUpdate = (ids: __IFeCustomCell['id'][]) => void;

// getItemsofCat
