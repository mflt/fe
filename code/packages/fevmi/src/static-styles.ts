import { lit_css as css, } from './_shared/lit-imports.js';

export const staticPromptStyles = {


  textField: css`
    :host {
      padding: 0.3em;
      padding-top: 0.3em;
      background-color: color-mix(in SRGB, white 95%, gray 10%);
      border-radius: 0.5em;
      // margin-right: 0.5em;
    }
    :host:focus {
      background-color: blue;
    }
  `,

  textBox: css`
    default-prompt-textbox-el {
      background-color: color-mix(in SRGB, white 95%, gray 5%);
      color: var(--input-text-color);
      font-size: calc(0.8em);
      font-family: var(--input-font-family);
      font-weight: lighter;
      margin-left: 0.5em;
      padding-right: 0.5em;
      min-height: 3em;
    }
    default-prompt-textbox-el:focus {
    }
  `,
}
