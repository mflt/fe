import { customElement, classMap, property, query } from '../_shared/lit-imports.js';
import {
  sp_html as html, sp_css as css, SpectrumElement, SpTemplateResult as TemplateResult
} from '../wrapped-spectrum/sp-imports.js';  // @TODO
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-magic-wand.js';


declare global {
  interface HTMLElementTagNameMap {
    'prompt-submit': PromptSubmitWc;
  }
  interface HTMLElementEventMap {
    'prompt-submit-evt': CustomEvent;
  }
}
@customElement('prompt-submit')
export class PromptSubmitWc extends SpectrumElement {

  // protected override createRenderRoot: ()=> HTMLElement = ()=> this;
  // protected createRenderRoot(): Element|ShadowRoot {
  //   return this;  // let the (React) contexts flow in
  // }

  static styles = css`
    :host {
      padding-right: 0.5em;
      padding-left: 0.5em;
      height: 100%;
    }
    /* sl-button {
      padding-top: 0.2em;
    } */
  `;

  // TODO<x>
  // @ts-ignore @TODO<x> caused by update to lit 3
  @query('sp-button') buttonEl: HTMLSpanElement | undefined;  // @TODO change type

  protected override render (): TemplateResult {

    return html`
      <sp-button variant="primary" label="Submit"
        @click=${() => {
        this.dispatchEvent(
          new CustomEvent('prompt-submit-evt', {
            bubbles: true, composed: true,
          }));

      }}
      >
        <sp-icon-magic-wand slot="icon"></sp-icon-magic-wand>
      </sp-button>
    `;
    // @TODO Event type
  }

  protected override updated () {
    this.buttonEl?.addEventListener('button', () => {
      console.log('[diag]: Submit updated')
    })
  }
}

