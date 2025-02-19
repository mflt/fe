import * as React from 'react';
import { useController } from '../_shared/lit-imports.js';
import { OnFePromptTextboxContentCtrlr, OnFePromptTextboxEnterupCtrlr } from '../comp-prompt/controllers.js';

export const useFePromptTextboxContent = (
  _evtCapturingNode: HTMLElement
) => {
  if (!_evtCapturingNode) {
    console.warn('[FE/useInputTextedit] Undefined node provided');
    return undefined;
  }
  const ctrlr = useController(
    React,
    host => new OnFePromptTextboxContentCtrlr(host, _evtCapturingNode)
  );
  // console.warn('[FE/useInputTextedit]',ctrlr.inputText)
  return ctrlr.content; // @TODO might rather be the getText instead?
}

export const useFePromptTextboxEnterup = (
  _evtCapturingNode: HTMLElement
) => {
  if (!_evtCapturingNode) {
    console.warn('[FE/useInputEnterup] Undefined node provided');
    return undefined;
  }
  const ctrlr = useController(
    React,
    host => new OnFePromptTextboxEnterupCtrlr(host, _evtCapturingNode)
  );
  // console.warn('[FE/useInputEnterup]',ctrlr.inputText)
  return ctrlr.content;
}
