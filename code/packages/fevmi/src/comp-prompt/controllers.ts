import { ReactiveControllerHost } from '../_shared/lit-imports.js';
import type {
  FeTextboxContentEvent, FeTextboxEnterupEvent
} from '../comp-textbox/types.js';

export class OnFePromptTextboxContentCtrlr {  // Content change event

  public content: string = '';

  constructor(
    private _host: ReactiveControllerHost,
    private _evtCapturingNode: HTMLElement,
  ) {
    this._host.addController(this);
  }

  _onTextboxContentChange = ({ detail }: FeTextboxContentEvent) => {
    this.content = detail.getContent() as string; // @TODO null
    // console.warn('CTRLR Edit',this.content)
    this._host.requestUpdate();
  };

  hostConnected () {
    // console.warn('CTRLR change connected',this._host, this._evtCapturingNode.tagName);
    this._evtCapturingNode.addEventListener<'fe-prompt-textbox-content-evt'>(
      'fe-prompt-textbox-content-evt',
      this._onTextboxContentChange
    );
  }
  hostDisconnected () {
    // console.warn('CTRLR change DISconnected',this._host, this._evtCapturingNode.tagName);
    this._evtCapturingNode.removeEventListener<'fe-prompt-textbox-content-evt'>(
      'fe-prompt-textbox-content-evt',
      this._onTextboxContentChange
    );
  }
}


export class OnFePromptTextboxEnterupCtrlr {

  public content: string = '';

  constructor(
    private _host: ReactiveControllerHost,
    private _evtCapturingNode: HTMLElement,
  ) {
    this._host.addController(this);
  }

  _onTextboxEnterup = ({ detail }: FeTextboxEnterupEvent) => {
    this.content = detail.content as string; // @TODO null
    // console.warn('CTRLR UP',this.content)
    this._host.requestUpdate();
  };

  hostConnected () {
    // console.warn('CTRLR connected',this._host, this._evtCapturingNode.tagName);
    this._evtCapturingNode.addEventListener<'fe-prompt-textbox-enterup-evt'>(
      'fe-prompt-textbox-enterup-evt',
      this._onTextboxEnterup
    );
  }

  hostDisconnected () {
    // console.warn('CTRLR Enter DISconnected',this._host, this._evtCapturingNode.tagName);
    this._evtCapturingNode.removeEventListener<'fe-prompt-textbox-enterup-evt'>(
      'fe-prompt-textbox-enterup-evt',
      this._onTextboxEnterup
    );
  }
}
