import type {
  FeUsedbyappRenderResultT, NID,
} from '../_integration/default-typing-and-naming.js';
import {
  customElement, nothing, state, ContextConsumer, ContextCallback, Context,
  lit_html as html, lit_css as css, LitElement, Lit_TemplateResult, PropertyValues,
} from '../_shared/lit-imports.js';
import type {
  IFeValue, _Fe_AnyI, IFeShape,
} from 'fe3';
import {
  CFeStrandViewmodel, IFeStrandVmSelfActions,
} from '../strand-viewmodel/index.js';
import { FeSequencerOutletWc } from '../out-sequencer/sequencer.outlet.js';

// @TODO implement pyl map handling

declare global {
  interface HTMLElementTagNameMap {
    'fe-slices-scroller': FeSlicesScrollerWc<_Fe_AnyI, IFeShape<_Fe_AnyI>>; // @TODO
  }
}
@customElement('fe-slices-scroller')
export class FeSlicesScrollerWc<
  TSliceValue extends IFeValue,
  TSliceShape extends IFeShape<TSliceValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT,
  IHostOrCustomActions extends {} = {},
> extends FeSequencerOutletWc<TSliceValue, TSliceShape, TGroupShape, RenderResult, IHostOrCustomActions> {

  // protected createRenderRoot = altCreateRenderRoot(this.options?.renderRoot, this, super.createRenderRoot);
  // protected override createRenderRoot: ()=> HTMLElement = ()=> this;
  // connects to the first parent w/o modded RenderRoot, like 'fe-portal' or the document (index)
  // place the styles there
  // private logTag = this.tagName + '/' + this.track?.trackLabel;

  // protected scroller: ReturnType<typeof this.newScroller>|undefined;

  constructor(
    strandvmRef?: CFeStrandViewmodel<TSliceValue, TSliceShape, TGroupShape, RenderResult, IHostOrCustomActions>,
    contextObj?: Context<unknown, CFeStrandViewmodel<TSliceValue, TSliceShape, TGroupShape, RenderResult, IHostOrCustomActions>>,  // @TODO unknown?
  ) {
    super(
      strandvmRef, // @TODO is it the intention here?
      {
        contextObj: contextObj,
        layout: {
          direction: 'vertical',
          repeaterWrapperStyles: {
            // overflow: 'scroll',
          }  // @TODO review
        },
        // flowbyRepeat: true,
        pinOnRerenders: 'end',
        renderRoot: null, // DOM @TODO
      }
    );
  }
  /*protected context = altSubscribetoContext<
    CFeTrackStrand<TSliceValue, TSliceShape, TGroupShape, RenderResult, IHostOrCustomActions>
  >(this, this.trackRef, this.contextObj, () => {
    // console.warn(`[${this.logTag}] context update`);
    this.pushBeat();
  });
  protected get track () { return this.trackRef || this.context?.value; }  // @TODO 1) unused 2) if this follows the sequencer's context pattern*/

  /*@state()
  protected beat = this.track?.beat || 0;
  public pushBeat = () => {
    this.beat = this.track?.beat || this.beat;
    this.scroller?.pushBeat();
  };

  private newScroller = ()=> new (

  });*/

  static styles = css`
  `;  // see styles at 'main'

  /*protected override render (): Lit_TemplateResult {

    if (!this.scroller) {
      console.warn(`[${this.logTag}] No render possible: missing virtualizer element`);
      return html`${nothing}`;
    }

    return html`${this.scroller}`;
  }*/


  /*protected _append: IFeTrackTopActions<TSliceValue, TSliceShape>['append'] = (
    triplet,
    valuesAppend,  // Here you could define your values appender, which is called before setting the shape, no else magic
  ) => {
        // @ts-ignore
        // const _id = (triplet as IFeValuewithNamedKeyProp<IFeValue, 'id'>).id || id; // @TODO id, weakmap
    const _track = this.track;
    if (!(triplet && (triplet.value || triplet.shape) && _track)) {
      console.warn(`[${this.logTag()}] Couldn\'t append new slice payload to scroller`);
      return undefined;
    }

        /!*if (this._track.valuesAreInMap()) {
          (this._track.values as unknown as Map<NID, IFeValue>).set(_id, pyl);
        } else {
          (this._track.values as unknown as IFeValue[]).push(pyl);
        } .... we don't touch values so instead: *!/

    _track.appendEntry(triplet,valuesAppend);
        // valuesAppend?.(triplet);
        // _track.setShapesEntry(triplet); // @TODO  non-weak maps, etc.
        /!*if (!_context.s.shapes?.has(_id)) {
          // @ts-ignore @TODO
          _context.shapes.set(_id,{
            // id: undefined,
          });
        }*!/
        // console.log('SET',_id,this._track.shapes?.get(_id)?.idx)
        /!*const shape = this.context.value?.s.getShapesEntry(
          this.context.value?.s.getValuesEntry(2)
        );
        console.log("WWWWWWWW WWWWWUPPPP", this.context.value?.s.getShapesEntry(
          this.context.value?.s.getValuesEntry(4)
        ),"XXX", shape);*!/

    // this.updateBeat(); done by the context update from the below upstream requestViewUpdate
    _track.announceContextRefresh();
    // _track.actions.track?.requestViewUpdate?.(); // In present this initiates forced context update, not requestUpdate

    // @TODO scrolling to the appended item works in present only by pinOnRerender mechanism
    // @TODO real solution should handle the update cycle specifics, as for example inFlowInx is set by the renderer in virtualizer on the new item
    // @TODO in general scrolling via the native api to the new html element is the solution, still needs update cycle connectedness
    // @TODO something for the upstream scrollIntoView implementation to do
    /!*const shape = this._track.getShapesEntry(triplet);
    if (shape) {
      console.warn('BUT SHAPE',shape);
      // this._track.actions.track.scrollToCell?.(shape.valueRef,{block:'start'});
      // this.flowVirtualizer.scrollToItem(shape.refs?.scrollIdx);
      // shape.components?.self?.value?.scrollIntoView();
    } else {
      console.warn('NO SHAPE');
    }*!/
    return 0; // this._track.shapes?.get(_id)?.id;  // @TODO will always return undefined yet (see update cycle)
  };*/

  /*protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    const _track = this.track;  // local variable is reasonable as track is a function
    // console.log('SCROLL updated', this._track)
    if (_track?.actions?.track) {
      _track.actions.track.append = this._append;
    } else {
      console.warn(`[${this.logTag()}]: Could not apply the necessary configuration.`)
    }
    // @ts-ignore
    // console.log("VER",this.hostEl,this[lit_virtualizerRef])
  }*/
}
