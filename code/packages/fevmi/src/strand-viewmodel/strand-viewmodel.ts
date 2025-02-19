import type {
  FeUsedbyappRefSpanElementT, FeUsedbyappRenderResultT, NID,
} from '../_integration/default-typing-and-naming.js';
import { feViewsIngressDefaults, } from '../_integration/default-typing-and-naming.js';
import {
  Context, ContextProvider, VirtualizerHostElement,
} from '../_shared/lit-imports.js';  // @TODO import from manifest-imports

import type {
  _Fe_AnyI, IFeValue, IFeShape, FeShapePartfromTripletGentr,
} from 'fe3';
import {
  _feIsFunction,
} from 'fe3/utils';
import {
  CFeStrand,
} from 'festrand/strand';
import {
  FeStrandViewmodelConfig, emptyFeStrandVmConfig,
} from './class-helpers.js';


export class CFeStrandViewmodel<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT, // @TODO
  IHostOrCustomActions extends {} = {},
>
  extends CFeStrand<TValue, TShape>
{
  // public options: FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['options'];
  //  = emptyFeStrandViewmodelConfig.options; // it only circumvents the compiler's issue with options not set in constructor (it's set in strand constructor)
  // @TODO runtime options modding might be a useful feature too

  protected _vmiLabel: typeof emptyFeStrandVmConfig.options.vmiLabel;
  get vmiLabel () { return this._vmiLabel; }
  set vmiLabel (
    label: typeof this._vmiLabel
  ) {
    this._vmiLabel = label;
  }

  protected _groupShapes: Map<NID, TGroupShape> | undefined;  // @TODO typing
  get groupShapes () {
    return this._groupShapes;
  };
  set groupShapes (
    groupShapesRefOrFn: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_groupShapes']
    /* | FeShapePartfromTripletGentr<_Fe_AnyI,IFeShape<_Fe_AnyI>> */) {
    this._groupShapes = (_feIsFunction(groupShapesRefOrFn) ? undefined : groupShapesRefOrFn); // @TODO
  };

  protected _templates: FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['templates']
    = emptyFeStrandVmConfig.templates as FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['templates'];  // @TODO simplify
  protected _actions: FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['actions']
    = emptyFeStrandVmConfig.actions as unknown as FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['actions'];
    // @TODO why unknown casting needed?

  // Getters and setters:

  public refs = {
    virtualizer: {
      hostElRef: undefined as FeUsedbyappRefSpanElementT | undefined,
      hostEl: null as VirtualizerHostElement | null,  // @TODO VirtualizerHostElement in manifest.types probably
      id: undefined as NID | undefined,
    },
    contextProvider: undefined as ContextProvider<Context<unknown,CFeStrandViewmodel<TValue,TShape,TGroupShape,RenderResult,IHostOrCustomActions>>> | undefined,
  };
  public host: IHostOrCustomActions | undefined;
  public customActions: IHostOrCustomActions | undefined;


  constructor(
    config: Partial<FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>,
    valuesRefOrFn?: CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_values'],
    shapesRefOrFn?:
      CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_shapes'] |
      FeShapePartfromTripletGentr<TValue, TShape>,
    groupShapesRefOrFn?:
      CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult>['_groupShapes'] |
      FeShapePartfromTripletGentr<_Fe_AnyI, IFeShape<_Fe_AnyI>>, // @TODO
  ) {
    super(
      {
        options: config.options || (emptyFeStrandVmConfig.options as CFeStrand<TValue, TShape>['options'])
      },  // strand viewmodel specific options are also transparently to be set by the strand constructor
      valuesRefOrFn,
      shapesRefOrFn,
    );
    // options.markers should always be set at this point by the strand constructor
    this.vmiLabel = config?.options?.vmiLabel || emptyFeStrandVmConfig.options.vmiLabel;
    config?.options?.preInit?.(this);

    // this.options.valueIdKey ||= frankieDefaults.keyPropName; assumed to be set by the empty... in strand constructor
    // this.options.vmiLabel ||= frankieDefaults.strandName;  assumed to be set by the empty...
    // this.options.catStrandName ||= frankieDefaults.defaultCatsStrandName;  // @TODO
    console.log('[fe-strand-vm] Constructor fired with name:', this.vmiLabel)

    this._groupShapes = _feIsFunction(groupShapesRefOrFn) ? undefined : groupShapesRefOrFn; // @TODO

    this.templates = config?.templates;
    this.actions = config?.actions;

    this.host = config?.options?.host;
    this.customActions = config?.options?.customActions;

    // @TODO if strand value / shape initiation needs any post work here

    config?.options?.postInit?.(this);

    console.warn(`[${this.vmiLabel}] Strand viewmodel constructed`)
    // @TODO most probably all triplet collections are undefined at this point depending on the instance bootstrap
  }

  public override appendEntry: CFeStrand<TValue,TShape>['appendEntry'] = (...params) => {
    super.appendEntry(...params);
    this.announceContextRefresh(false);
    // will not pushBeat as that does it, while relying on the false return value of appendEntry may not mean a failure
  }

  public override prependEntry: CFeStrand<TValue,TShape>['prependEntry'] = (...params) => {
    super.prependEntry(...params);
    this.announceContextRefresh(false);
    // will not pushBeat as that does it, while relying on the false return value of appendEntry may not mean a failure
  }

  public announceContextRefresh (
    suppressPushingBeat?: boolean,
  ) {
    if (!suppressPushingBeat) {
      this.pushBeat?.();
    }
    this.refs.contextProvider?.setValue(this, true);
  }

  public get templates (): FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['templates'] {
    return this._templates || emptyFeStrandVmConfig.templates;
  }
  protected set templates (
    initial: Partial<typeof this._templates> | undefined,
  ) {
    this._templates = { ...initial } as typeof this._templates;
    this._templates.self ||= feViewsIngressDefaults.renderNothing;
    this._templates.group ||= feViewsIngressDefaults.renderNothing;  // @TODO might not be the right solution, undefined has its meaning
    // this._templates.cellWrapper ||= feViewsIngressDefaults.renderNothing;
    this._templates.cellContent ||= feViewsIngressDefaults.renderNothing;
    this._templates.renderItem ||= feViewsIngressDefaults.renderNothing;
  }
  public updateTemplates (
    newOrUpdated: Partial<typeof this._templates>,
    options = {
      reset: false as boolean,
    }
  ) {
    this._templates = {
      ...this._templates,
      ...newOrUpdated,
    }
  }

  public get actions (): FeStrandViewmodelConfig<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>['actions'] {
    return this._actions || emptyFeStrandVmConfig.actions;
  }
  protected set actions (
    initial: Partial<typeof this._actions> | undefined,
  ) {
    this._actions = { ...initial } as typeof this._actions;  // ensures excluded undefinedness
    this._actions.self ||= {};
    this._actions.group ||= {};
    this._actions.cell ||= {};
    // * action sections should be defined initially, to avoid dealing with their possible undefined cases
  }
  public updateActions (
    newOrUpdated: Partial<typeof this.actions>,
    options = {
      reset: false as boolean,
    }
  ) {
    if (options.reset) {
      this.actions = undefined;
    }
    this.actions = {
      ...this.actions,
      ...newOrUpdated,
    }
  }

  // get scrollActions() { return this.actions.scrollActions; }
  // get messageActions() { return this._messageActions; }
}

// The below class version (making all members public) is handling the issue:
// https://stackoverflow.com/questions/55242196/typescript-allows-to-use-proper-multiple-inheritance-with-mixins-but-fails-to-c
// https://github.com/Microsoft/TypeScript/issues/17293

export class _CFeViewmodel_AllMembersPublic<
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
  TGroupShape extends IFeShape | undefined = undefined,
  RenderResult extends {} = FeUsedbyappRenderResultT, // @TODO
  IHostOrCustomActions extends {} = {}
>
  extends CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>
{
  // @TODO This problem has gone with defining _Fe_GConstructor as the explicit return type of the ComposeStrandVmClassBase mixin. See the above comment wrt which problem
  // declare _beat; ?? was not tested
  // declare _vmiLabel;
  // declare _values;
  // declare _shapes;
  // declare _groupShapes;
  // declare _actions;
  // declare _templates;
  // declare _iterableByShapes;
  constructor(
    config: ConstructorParameters<typeof CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>[0],
    valuesRefOrFn: ConstructorParameters<typeof CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>[1],
    shapesRefOrFn: ConstructorParameters<typeof CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>[2],
    groupShapesRefOrFn: ConstructorParameters<typeof CFeStrandViewmodel<TValue, TShape, TGroupShape, RenderResult, IHostOrCustomActions>>[3],
  ) {
    super(
      config,
      valuesRefOrFn,
      shapesRefOrFn,
      groupShapesRefOrFn,
    );
  }
}
