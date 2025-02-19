import * as React from 'react';
import { createComponent, EventName } from './lit-react-imports.js';
import type { FeTextboxContentEvent, FeTextboxEnterupEvent } from '../comp-textbox/types.js';  // @TODO maybe refer to the root index or package
import { FePromptTextboxWc } from '../comp-textbox/Textbox.wc.js';
import { FeSlicesScrollerWc } from '../comp-slices-scroller/slices-scroller.wc.js';

// export const Prompt = createComponent({
//   tagName: 'fe-prompt-composer',
//   // @ts-ignore @TODO
//   elementClass: PromptWc,
//   react: React,
//   events: {
//     onTextInputEdit: 'prompt-input-text-evt' as EventName<PromptInputTextEditEvent>,
//     onTextInputEnter: 'prompt-input-enter-evt' as EventName<PromptInputEnterUpEvent>,
//     onSubmitClick: 'prompt-submit-evt',
//   }
// });

export const FePromptTextboxC = createComponent({
  tagName: 'fe-prompt-textbox',
  elementClass: FePromptTextboxWc,
  react: React,
  events: {
    onInput: 'fe-prompt-textbox-content-evt' as EventName<FeTextboxContentEvent>,
    onEnter: 'fe-prompt-textbox-enterup-evt' as EventName<FeTextboxEnterupEvent>,
  }
});

export const FeSlicesScrollerC = createComponent({
  tagName: 'fe-slices-scroller',
  // @ts-ignore @TODO
  elementClass: FeSlicesScrollerWc,
  react: React,
});
