import {
  ContextConsumer, customElement, lit_css as css, lit_html as html, Lit_TemplateResult, LitElement, Context,
  property, query, PropertyValueMap
} from '../_shared/lit-imports.js';
import { altSubscribetoContext, altCreateRenderRoot } from '../utils/utils.js';
import {
  IFeTextboxStore, IFeTextboxOptions, IFeTextboxActions, FeTextboxElement, FeTextboxContent,
  FeTextboxContentEvent, FeTextboxContentEventDetail, FeTextboxContentListener,
  FeTextboxEnterupEvent, FeTextboxEnterupEventDetail,
  FeTextboxFocusinEvent, FeTextboxFocusoutEvent,
} from './types.js';
import { IFeContextofPrompt, IFePromptTextboxOptions } from '../comp-prompt/types.js';  // @TODO
import { staticPromptStyles } from '../static-styles.js';


declare global {
  interface HTMLElementTagNameMap {
    'fe-prompt-textbox': FePromptTextboxWc,
  }
  interface HTMLElementEventMap {
    'fe-prompt-textbox-content-evt': FeTextboxContentEvent,
    'fe-prompt-textbox-enterup-evt': FeTextboxEnterupEvent,
    'fe-prompt-textbox-focusin-evt': FeTextboxFocusinEvent,
    'fe-prompt-textbox-focusout-evt': FeTextboxFocusoutEvent,
  }
}
@customElement('fe-prompt-textbox')
export class FePromptTextboxWc extends LitElement {

  protected override createRenderRoot = altCreateRenderRoot(this.options?.renderRoot, this, super.createRenderRoot);
  /*static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegateFocus: true,
    // mode: 'open' as ShadowRootMode
  };*/
  /*@property()
  mode = 'default';*/

  @property({ type: Object })
  protected textboxStore?: IFeTextboxStore;

  @property({ type: Object })
  protected options?: IFePromptTextboxOptions;

  // public textfieldAttributes?: PromptTextboxAttributes = {}; // @TODO

  constructor() {
    super();
    /*textfieldAttributes.id ||= 'prompt-input';
    textfieldAttributes.autofocus ||= true;
    textfieldAttributes.placeholder ||= 'Your prompt goes here';*/
    // this.addEventListener('focus', ()=> console.log('[diag] TextField focus'));
    this.addEventListener('focusin', _ => {
        console.warn('textbox FOCUS ######')
        this.dispatchEvent(
          new CustomEvent('fe-prompt-textbox-focusin-evt', {
            bubbles: true, composed: true,
        }));
    });
    this.addEventListener('focusout', _ => {
      console.warn('textbox focus OUT ######')
      this.dispatchEvent(
        new CustomEvent('fe-prompt-textbox-focusout-evt', {
          bubbles: true, composed: true,
      }));
    });
    this.addEventListener('keyup', evt => {
      if (/*[10,13].includes(evt.keyCode)*/ evt.key === 'Enter' && !evt.ctrlKey && !evt.shiftKey) {
        // console.warn('portal textbox KEY 1111######',this.textBox)
        // if (!this.enterHandler?.(this.textField?.textContent)) {
        if (this.store) {
          this.store.content = this.textBox?.value;
          this.store.pushBeat?.();
        }
        this.dispatchEvent(
          new CustomEvent<FeTextboxEnterupEventDetail>('fe-prompt-textbox-enterup-evt', {
            bubbles: true, composed: true,
            detail: { content: this.textBox?.value },
        }));
        // }  @TODO
      }
    });
    this.addEventListener('input', evt => {
      evt.stopPropagation();
      // console.warn('portal textbox INPUT 1111######',this.textBox)
      if (this.store) {
        this.store.content = this.textBox?.value;
      }
      /*if (typeof this.options?.inputListener === 'function') {
        this.options?.inputListener(this.textBox?.value);
      } else {*/
      // console.log('[diag] TextField:', this.textBox?.value);
      this.dispatchEvent(
        new CustomEvent<FeTextboxContentEventDetail>('fe-prompt-textbox-content-evt', {
          bubbles: true, composed: true,
          detail: { getContent: () => this.textBox?.value },
      }));
    });
  }
  protected context = altSubscribetoContext<IFeTextboxStore, IFeContextofPrompt, 'textbox'>(this, this.textboxStore, this.options?.contextObj);
  get store () { return this.textboxStore || this.context?.value?.textbox; }

  static styles = [css`
    :host {
      --mod-textfield-border-width: 0;
      --mod-textfield-text-color-default: lightgray;

      display: block;
      flex: 1;
      background-clip: border-box;
      height: fit-content;
      width: inherit;
      align-content: flex-start;
      // overflow: scroll;
      overflow-wrap: break-word;
    }
    :host:focus {
    }
    :host > div { // aka .input-block
      display: block;
      width: 100%;
      max-width: inherit;
      overflow: hidden;
    }`,
    staticPromptStyles.textBox
  ];

  // @ts-ignore @TODO<x> caused by update to lit 3
  // @query('#fe-prompt-textbox-el')
  // textBoxEl: HTMLInputElement|undefined;  // @TODO does not work due to slot chaining in shadows or something

  textBox: FeTextboxElement | { value: string | number } = { value: '' };   // @TODO change type
  // @query('#cvrme-prompt-textfield-el') textBox!: FeTextboxElement;   // @TODO change type

  protected override render (): Lit_TemplateResult {
    const _store = this.store;
    return html`
      <div class='input-block'>
        <slot name='textbox'>
          <span id='fe-prompt-textbox-el---x' class="default-prompt-textbox-el"
                role='textbox' contenteditable autofocus
                .innerText=dollar{content}
          ></span>
        </slot>
      </div>
    `;
  }

  protected override firstUpdated (_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties);
    // console.warn('portal textbox const first updated 1111######',this.options?.id,this.store?.element)
    // @ts-ignore
    // this.textBox = document.getElementById(this.options?.id ? '#'+this.options?.id : '#fe-prompt-textbox-el') || { value: 'aaa' };
    const _store = this.store;
    // @ts-ignore
    this.textBox = _store?.element;
    if (_store) {
      // console.warn('portal textbox const first updated 1111######', this.textBox)
      _store.setContent =
        (v: Parameters<Exclude<IFeTextboxActions['setContent'], undefined>>[0]) =>
          this.textBox.value = v;
      _store.clearContent = () => _store.setContent?.('');
      /*_store.focus = (options) => { // @TODO does not work due to slot chaining in shadows or something
        if (this.textBoxEl) {
          this.textBoxEl?.focus(options);
        }
        console.warn('portal textbox focus', this.textBoxEl);
      };*/
    } else {
      // console.warn('portal textbox const first updated 1111###### no STORE', this.textBox, this.options?.id)
    }
  }
}

