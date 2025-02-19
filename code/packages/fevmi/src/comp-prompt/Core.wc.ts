import {
  customElement, consume, state, LitElement, lit_css as css, lit_html as html, Lit_TemplateResult, property,
} from '../_shared/lit-imports.js';
import { altCreateRenderRoot, altSubscribetoContext } from '../utils/utils.js';
import { IFeContextofPrompt, IFePromptStore, IFePromptTextboxOptions } from './types.js';
import '../comp-textbox/Textbox.wc.js';
import './submit.js';

// export type PromptInputAttributes = Partial<HTMLInputElement> & {
//
// }

export const defaultPromptStyles = css`
  :host {
    display: block;
    width: 100%;
  }
  #wrapper {
    font-size: calc(14px + 0.5vmin);
    --wrapper-color-blend: white;
    --input-text-color: color-mix( in SRGB, black 75%, var(--base-prompt-background-color) 20%);
    color: var(--wrapper-color-blend);

    display: flex;
    flex-direction: row;
    // width: 100%;
    // flex: 1;
    background-color: color-mix( in SRGB, var(--base-prompt-background-color) 40%, var(--wrapper-color-blend) 2%);
    /*padding: 0.75em;
    margin: 0.2em;
    margin-top: 0.4em;
    margin-bottom: 0.2em;*/
    border-radius: 1em;
    background-clip: border-box;
  }
`;

declare global {
  interface HTMLElementTagNameMap {
    'fe-prompt-core': FePromptCoreWc,
  }
}
@customElement('fe-prompt-core')
export class FePromptCoreWc extends LitElement {

  protected override createRenderRoot = altCreateRenderRoot(this.options?.renderRoot, this, super.createRenderRoot);

  @property({ type: Object })
  protected promptStore?: IFePromptStore;

  @property({ type: Object })
  protected options?: IFePromptTextboxOptions;

  constructor() {
    /*protected promptStore?: IFePromptStore,
    protected options?: {
      contextObj?: Context<unknown, IFeContextofPrompt>,
      inputListener?: FePromptTextboxContentListener,
      renderRoot?: HTMLElement,
    },*/
    /*public dropDefaultStyles: false,
    public inputAttributes: PromptInputAttributes = {
      textContent: 'AAA',
    },*/
    super();
    // inputAttributes.type ||= 'text';
  }
  protected context = altSubscribetoContext<IFePromptStore, IFeContextofPrompt, 'textbox'>(this, this.promptStore, this.options?.contextObj);
  get store () { return this.promptStore || this.context?.value; }

  // static get styles() { return [defaultPromptStyles] };

  static styles = css`
    :host {
      // display: block;
      display: contents;
      width: 100%;
      font-size: calc(12px + 0.5vmin);
      // font-size: calc(10px + 2vmin);
      color: #1a2b42;
      text-align: center;
      // background-color: var(--appy-ez-background-color);
    }
    .wrapper {
      display: flex;
      width: --webkit-fill-available;
      flex-direction: row;
      align-items: center;
      background-color: black;
      margin: 7px;
      border-radius: 10px;
      padding: 0.25em;
    }
  `;  // the wrapper is useful to override from css

  // @query('prompt-textfield') textField: IPromptTextFieldWc|undefined; // @TODO

  protected override render (): Lit_TemplateResult {
    return html`
      <span class='wrapper'>
        <slot name='prepending'></slot>
        
        <fe-prompt-textbox
          .textboxStore=${this.promptStore?.textbox}
          .options=${this.options}
        >
          <span slot='textbox'>
            <slot name='textbox'></slot>
          </span>
        </fe-prompt-textbox>
        
        <slot name='prepending-buttons'></slot>
        
        <slot name='buttons'>
          <prompt-submit></prompt-submit>
        </slot>
        
        <slot name='appending'></slot>
      </span>
    `;  // @TODO implement ifDefined
  }
}

