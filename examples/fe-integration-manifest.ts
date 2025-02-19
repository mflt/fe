import type { IFeDefaultTypingAndNamingTokens } from 'fevmi';
import type { NID } from '../common.config/common-types-manifest.js';
import type { TemplateResult, SpectrumElement } from '@spectrum-web-components/base';


// @ts-ignore @TODO Spectrum vs Lit type conflict
interface IFeMyTypingAndNamingTokens extends IFeDefaultTypingAndNamingTokens {

  defaults: IFeDefaultTypingAndNamingTokens['defaults'],
  coreTs: {
    NID: NID;
  },
  viewTs: Omit<IFeDefaultTypingAndNamingTokens['viewTs'],'RenderResultT'|'WcElementT'> & {
    RenderResultT: TemplateResult,
    WcElementT: SpectrumElement,
  },
}

declare namespace feTypingAndNamingTokens {
  var defaults: IFeMyTypingAndNamingTokens['defaults'];
  var coreTs: IFeMyTypingAndNamingTokens['coreTs'];
  var viewTs: IFeMyTypingAndNamingTokens['viewTs'];
}
