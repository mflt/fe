import {
  customElement, classMap, property, PropertyValues, queryAsync, provide, ifDefined,
  lit_html as html, lit_css as css, LitElement, Lit_TemplateResult,
  ContextProvider,
} from '../_shared/lit-imports.js';
import { altCreateRenderRoot, altSubscribetoContext } from '../utils/utils.js';
import { IFeContextofPrompt, IFePromptStore, IFePromptTextboxOptions } from './types.js';
import { createContextofPrompt } from './context.js';
import './Core.wc.js';
// import './subject.js';

export const contextofPrompt = createContextofPrompt('fe-context-of-prompt');  // @TODO temporarily placed here

declare global {
  interface HTMLElementTagNameMap {
    'fe-prompt-composer': FePromptComposerWc; // @TODO
  }
}
@customElement('fe-prompt-composer')
export class FePromptComposerWc extends LitElement {

  protected override createRenderRoot = altCreateRenderRoot(this.options?.renderRoot, this, super.createRenderRoot);

  @property({ type: Object })
  protected promptStore?: IFePromptStore;

  @property({ type: Object })
  protected options?: IFePromptTextboxOptions;

  constructor() {
    /* protected store: typeof _exAbstractStoreofStrands,
    protected subjectText?: string, */
    super();
    this.addEventListener<'fe-prompt-textbox-focusin-evt'>('fe-prompt-textbox-focusin-evt', _ => {
      // console.warn('[composer] textbox focus ######');
    });
    this.addEventListener<'fe-prompt-textbox-focusout-evt'>('fe-prompt-textbox-focusout-evt', _ => {
      // console.warn('[composer] textbox focus out ######');
    });
    this.addEventListener<'fe-prompt-textbox-content-evt'>('fe-prompt-textbox-content-evt', evt => {
      // evt.stopPropagation();
      // console.warn('before',mainStore.promptText);
      // @ts-ignore
      // mainStore.setPromptText(evt.detail?.getText?.()); // @TODO unused since exome did not update the react dispatcher
      // console.warn('text',mainStore.promptText);
      // @ts-ignore
      // dialogStore.host?.handleUserUtteranceChange?.(evt);
      // this.dispatchEvent(
      //   new CustomEvent<PromptInputTextEditEventDetail>('prompt-input-text-evt', {
      //     bubbles: true, composed: true,
      //     detail: evt.detail // textField?.textContent,
      // }));
      // console.log('[diag] PromptwStrands: text:', evt.detail?.getText?.())
    });
    this.addEventListener<'fe-prompt-textbox-enterup-evt'>('fe-prompt-textbox-enterup-evt', evt => {
      // evt.stopPropagation();
      // console.warn('upup')
      // @ts-ignore
      // dialogStore.host?.handleSubmit?.();
      //this.storeofDialogProvider.value?.onTextInputEnter?.(evt);
      // this.dispatchEvent(
      //   new CustomEvent<PromptInputEnterUpEventDetail>('prompt-input-enter-evt', {
      //     bubbles: true, composed: true,
      //     detail: evt.detail // textField?.textContent,
      // }));
    });
  }
  protected context = altSubscribetoContext<IFePromptStore, IFeContextofPrompt, 'textbox'>(this, this.promptStore, this.options?.contextObj); // @TODO
  get store () { return this.promptStore || this.context?.value; }

  // protected contextProvider = new ContextProvider(
  //   // @ts-ignore @TODO<x> caused by update to lit 3
  //   this, {
  //     context: contextofPrompt,
  //     initialValue: {
  //       beat: 0,
  //       textbox: {},
  //     }
  // });

  static styles = css`
    :host {
      // display: block;
      display: contents;
      width: 100%;
      font-size: calc(12px + 0.5vmin);
      // font-size: calc(10px + 2vmin);
      color: #1a2b42;
      text-align: center;
      background-color: var(--appy-ez-background-color);
    }

    .wrapper {
      display: grid;
      grid-template-areas:
        'top top top'
        'left core right'
        'bottom bottom bottom'
      ;
      grid-template-columns: min-content 1fr min-content;
      grid-template-rows: min-content 1fr min-content;
    }
  `;  // the wrapper is useful to override from css


  protected override render (): Lit_TemplateResult {

    // console.log('prompt-w rendered');

    return html`
      <span class='wrapper'>
      
        <fe-prompt-core
          .promptStore=${this.promptStore}
          .options=${this.options}
        >
          <span slot='textbox'>
            <slot name='textbox'></slot>
          </span>
          <span slot='buttons'>
            <slot name='buttons'></slot>
          </span>
          <span slot='core-prepending'>
            <slot name='prepending'></slot>
          </span>
          <span slot='core-prepending-buttons'>
            <slot name='prepending-buttons'></slot>
          </span>
          <span slot='core-appending'>
            <slot name='appending'></slot>
          </span>
        </fe-prompt-core>
        
        <span style="grid-area:top">
          <slot name='top'></slot>
        </span>
        <span style="grid-area:bottom">
          <slot name='bottom'></slot>
        </span>
        <span style="grid-area:left">
          <slot name='left'></slot>
        </span>
        <span style="grid-area:right">
          <slot name='right'></slot>
        </span>
      </span>
    `;
  }

  /*protected override firstUpdated (_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    // console.warn('composer 1st up ###### MEME', this.contextProvider?.value)
  }*/
}


/*
  #ctx-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    //align-content: center;
    background-color: var(--base-choices-background-color);
    // padding: 0.2em;
    padding-top: 0.5em;
    border-radius: 1em;
    background-clip: border-box;
  }
  #tasks-wrapper {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    //align-content: center;
    background-color: var(--base-requirements-background-color);
    // padding: 0.2em;
    padding-top: 0em;
    border-radius: 1em;
    background-clip: border-box;
  }
*/