import {
  customElement, lit_html as html, lit_css as css, nothing,
  LitElement, Lit_TemplateResult as TemplateResult,
} from '../_shared/lit-imports.js';
import {
  _feIsArray, _feIsObject,
} from '../_shared/fe-imports.js';
import {
  FeUsedbyappRenderResultT, FeUsedbyappRefLIElementT, FeUsedbyappRefSpanElementT,
  FeElementProps, FeLayoutAndViewmodelConfigBase, FeElementBaseConfig, /*FePersistenceGetLeaf*/
} from '../_shared/types.js';
import { altCreateRenderRoot } from '../utils/utils.js';
// import { getGlobalFePersistence } from '../out-persistence/persistence.outlet.js';
// import { FeStateful } from '../out-persistence/index.js';


// An abstract class will never be instantiated so needs no customElements treatment
export abstract class FeElementBaseWc <
  RenderResult extends {} = FeUsedbyappRenderResultT,
>
  extends LitElement  // @TODO manifest type actually
  implements FeElementProps
{
  fePart = '_element-base';
  protected logTag = (sub?: string) => '[' + this.fePart + (sub ? '/' + sub : '') + ']:';

  protected readonly options!: FeElementBaseConfig;

  // public static persistenceBinding?: FeStateful.Binding;
  protected p!: {};
    // the node actually persisting on the global scope to assign state props which constitute the view/element instance's state
    // including the user's dirt
    // @TODO

  constructor(
    options?: FeElementBaseConfig
  ) {
    super();

    // State:
    this.options = this.options || options; // might be already set being overridden upstream
    if (!_feIsObject(this.options)) {
      this.options = {};
    }

    // View:
    this.createRenderRoot = altCreateRenderRoot(this.options.renderRoot, this, super.createRenderRoot);

    // @TODO iterate instead
    if (this.options.attributes?.id) {
      this.id = this.options.attributes.id; // assignment of undefined avoided in order to not override a possibly existing attr
    }
    if (this.options.attributes?.slot) {
      this.slot = this.options.attributes.slot; // assignment of undefined avoided in order to not override a possibly existing attr
    }

    // this.p = this.options.stateful?.getLeaf?.(this) || getGlobalFePersistence?.().getLeaf(this) || {}; // @TODO WIP
  }
}