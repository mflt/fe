import { type IFeReactiveBeat } from 'fe3/beat';

export type FeTextboxElement = HTMLSpanElement & { value: Exclude<FeTextboxContent, null> };

export type FeTextboxContentClearer = () => void;
export type FeTextboxEnterupHandler = (value: FeTextboxContent) => boolean;  //  if true (!), then does not dispatch

export type IFeTextboxActions = {
  enterupHandler?: FeTextboxEnterupHandler,
  clearContent?: FeTextboxContentClearer, // @TODO
  setContent?: (v: Exclude<FeTextboxContent, null>) => void,
  getContent?: () => FeTextboxContent,
  focus?: (options?: FocusOptions) => void,
};

export type FeTextboxContent = string | number | null;
export type FeTextboxContentListener = (newTextboxContent: FeTextboxContent) => void;
export type FeTextboxContentEventDetail = { getContent: () => FeTextboxContent };
export type FeTextboxContentEvent = Event & { detail: FeTextboxContentEventDetail };  // aka input
export type FeTextboxEnterupEventDetail = { content: FeTextboxContent };
export type FeTextboxEnterupEvent = Event & { detail: FeTextboxEnterupEventDetail };  // aka keyup && evt.key === 'Enter'
export type FeTextboxFocusinEvent = Event & {};
export type FeTextboxFocusoutEvent = Event & {};

export type IFeTextboxStore = {
  content: FeTextboxContent,
  element?: FeTextboxElement;
}
  & IFeTextboxActions
  & IFeReactiveBeat<number>
  ;

export type IFeTextboxOptions = {
  id?: string,
  renderRoot?: HTMLElement | null,  // when null it returns this
  helpText?: string,
};
