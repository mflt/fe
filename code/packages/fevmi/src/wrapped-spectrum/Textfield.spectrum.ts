import {
  customElement, property, query, consume, state, PropertyValues, LitElement, ifDefined,
  lit_createRef, ref,
} from '../_shared/lit-imports.js';
import {
  sp_html as html, sp_css as css, SpectrumElement, SpTemplateResult as TemplateResult
} from './sp-imports.js';
import { altCreateRenderRoot } from '../utils/utils.js';
import type { IFeTextboxStore, IFeTextboxOptions, FeTextboxElement } from '../comp-textbox/types.js'; // @TODO maybe refer to the root index or package
import { Textfield, TextfieldType } from '@spectrum-web-components/textfield/src/Textfield.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
// import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/help-text/sp-help-text.js';


@customElement('fe-textfield-spectrum')
export class FeTextfieldSpectrumWc extends SpectrumElement {

  protected override createRenderRoot = altCreateRenderRoot(this.options?.renderRoot, this as unknown as LitElement,
    super.createRenderRoot as unknown as ()=>HTMLElement) as unknown as ()=>HTMLElement;

  @property({ type: Object })
  protected store?: IFeTextboxStore;

  @property({ type: Object })
  protected options?: IFeTextboxOptions;

  // from https://github.com/adobe/spectrum-web-components/blob/main/packages/textfield/src/Textfield.ts
  // BEGIN

  @property({ type: Boolean, reflect: true })
  public focused = false;

  @property({ type: Boolean, reflect: true })
  public invalid = false;

  @property()
  public label = '';

  @property()
  public placeholder = '';

  @property({ reflect: true })
  public type: TextfieldType = 'text';

  @property()
  public pattern?: string;

  @property({ type: Boolean, reflect: true })
  public grows = false;

  @property({ type: Number })
  public maxlength = -1;

  @property({ type: Number })
  public minlength = -1;

  @property({ type: Boolean, reflect: true })
  public multiline = false;

  @property({ type: Boolean, reflect: true })
  public readonly = false;

  @property({ type: Number })
  public rows = -1;

  @property({ type: Boolean, reflect: true })
  public valid = false;

  // value

  @property({ type: Boolean, reflect: true })
  public quiet = false;

  @property({ type: Boolean, reflect: true })
  public required = false;

  // END

  @property({ type: String })
  public set value(v: string | number) {
    if (v !== this.value) {
      const oldValue = this.store?.content;
      this.store?.setContent?.(v);
      this.requestUpdate('value', oldValue);
    }
  }
  public get value(): string | number {
    return this.store?.content as string | number;
  }

  @property({ attribute: 'help-text' })
  public helpText = '';

  protected textBoxRef = lit_createRef<Textfield>();

  constructor() {
    super();
  }

  static styles = [css`
    #fe-prompt-textbox-el {
      // display: flex;
      // flex: 1;
      border: none;
      // height: fit-content;
      // text-align: left;
      //inline-size: 100%;
      //max-inline-size: 90%;
      width: 100%;
      // height: 2em;
      // max-width: inherit;
    }
    #fe-prompt-textbox-el:focus {
      outline: none;
    }`,
    // staticPromptStyles.input
  ];

  // @query('#cvrme-prompt-textfield-el') textBox!: FeTextboxElement;   // @TODO dynamic query!!
  // textBox: FeTextboxElement | { value: string | number } = { value: '' };

  protected override render (): TemplateResult {
    // console.warn('SP TEXTFIELD',this.store?.textbox?.content)
    return html`
      <sp-textfield
          value=${this.value}
          id=${this.options?.id || 'fe-prompt-textbox-el' /* @TODO */}
          ?multiline=${ifDefined(this.multiline)}
          ?grows=${ifDefined(this.grows)}
          .placeholder=${ifDefined(this.placeholder)}
          .pattern=${ifDefined(this.pattern)}
          style="
            padding-right: 1em;
            padding-left: 0.5em;
            padding-top: 0.25em;
            --spectrum-textfield-width: -webkit-fill-available;
          "
          ${ref(this.textBoxRef)}
      >
        <sp-help-text slot="help-text">
            ${ifDefined(this.helpText)}
        </sp-help-text>
        <!--sp-help-text slot="negative-help-text">Please be "Positive".</sp-help-text-->
      </sp-textfield>
    `;
  }

  protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    // @ts-ignore
    // this.textBox = this.shadowRoot.getElementById(this.options?.id ? '#'+this.options?.id : '#fe-prompt-textbox-el');

    if (this.store) {
      // @ts-ignore
      this.store.element = this.textBoxRef.value;
      // console.warn('#### SPEEE',this.options?.id,this.store.element)
    } else {
      // console.warn('#### SPEEE NO STORE',this.textBoxRef.value)
    }
  }
}
