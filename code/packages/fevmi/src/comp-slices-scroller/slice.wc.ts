import {
  customElement, property, classMap, styleMap, PropertyValues
} from '../_shared/lit-imports.js';
import {
  sp_html as html, sp_css as css, SpectrumElement, SpTemplateResult as TemplateResult
} from '../wrapped-spectrum/sp-imports.js'; // @TODO
import type {
  _Fe_AnyI, IFeValue, IFeTriplet, IFeShape,
} from 'fe3';
import {
  FeInstrandCellTemplate, FeInstrandCellWrapperTemplate,
} from '../strand-viewmodel/strandvm-templates.i-f.js';
import { BeakerIcon } from '@spectrum-web-components/icons-workflow';
import '@spectrum-css/well/dist/index-vars.css'; //  @TODO shadow


declare global {
  interface HTMLElementTagNameMap {
    'fe-slice-in-scroller': FeSliceinScrollerWc<_Fe_AnyI, IFeShape<_Fe_AnyI>>; // @TODO
  }
}
@customElement('fe-slice-in-scroller') // won't be seen in html when called from scroll, see spectrum-Well
export class FeSliceinScrollerWc<
  TSliceValue extends IFeValue,
  TSliceShape extends IFeShape<TSliceValue>,
> extends SpectrumElement /* implements FeStrandCellWrapperTemplate<TPyl,TShape> */ {

  protected override createRenderRoot: ()=> HTMLElement = ()=> this;
  // connects to the first parent w/o modded RenderRoot, like 'scroll' or 'fe-portal' or the document (index)
  // place the styles there
  // lets the ReactContexts flow in

  constructor(
    public triplet: IFeTriplet<TSliceValue, TSliceShape> | undefined,
    public cellTemplate: FeInstrandCellTemplate<TSliceValue, TSliceShape>,
    public domKey: string,
    public scrollIndex?: number,  // @TODO unused
  ) {
    super();
    // console.log('constr', JSON.stringify(this.cellTemplate))
  }

  static styles = css`
  `;
  // :host [aka fe-slice-in-scroller], .spectrum-Well and .scrollMountEl [see children] are coming from the RenderRoot
  protected wellClasses = {
    'spectrum-Well': true,
    'fe-slice-in-scroller': true,
  }
  protected customWellStyle = {
    // 'background-color': 'blue',
  }

  protected override render () {
    // console.log('rend', JSON.stringify(this.triplet))
    // this.setElRef?.(this);
    // console.log("[fe-slice-in-scroller]:", this.scrollIndex) //, JSON.stringify(this.Props))
    // _props.turn?.party===DialogParty.Ai? 'yellow' : 'lightblue',
    return html`
      <div role='region' class=${classMap(this.wellClasses)} style=${styleMap(this.customWellStyle)}>
        <div style='display:flex; flex-direction:row;' >
          ${BeakerIcon({ width: 24, height: 24 })}
          ${this.cellTemplate?.(this.triplet, undefined, this.domKey)}
        </div>
      </div>
    `;
  }

  protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    //this.setElRef?.(this);
  }
}

/*
style={{
  /*textAlign: _props.leftRight || 'left',
  flex: 1,
  margin: 15,
  marginTop: 5,
  padding: 15,
  borderRadius: 10,
  textAlign: props.leftRight || 'left',
  backgroundColor: props.turn.party===DialogParty.Ai? 'lightcyan' : 'lightblue',
}} onMouseOver={() => setHighlightedItem(item.ts)}  */
