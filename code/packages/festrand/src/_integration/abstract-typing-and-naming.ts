
// The configuration of default props naming and view types / object shapes for integration with the app using us
// declared in the upstream app configuration manifest (aka used by app)
// which then we pass downstream to our frankie library/es as ingress defaults


export interface IFeAbstractTypingAndNamingTokens {

  defaults: {
    keyPropName: string,
    groupPropName: unknown,
    strandLabel: string,
    groupedStrandLabel: unknown,
    renderNothing: unknown, // Function, // @TODO
  },
  coreTs: {
    NID: unknown; // unknown in order to allow the resolution of _NID below
  },
  viewTs: {
    RenderResultT: unknown, // Object, // @TODO add T type w/ proper constraints
    WcElementT: unknown, // Object,
    RefListElementT: unknown, // Object,
    RefLIElementT: unknown, // Object,
    RefSpanElementT: unknown, // Object,
    ContextConsumerT: unknown, // Object,
    RenderItemFunctionT: unknown, // Function,  // @TODO review problems with this typing approach
  },
}

declare namespace feTypingAndNamingTokens {
  var defaults: IFeAbstractTypingAndNamingTokens['defaults'];
  var coreTs: IFeAbstractTypingAndNamingTokens['coreTs'];
  var viewTs: IFeAbstractTypingAndNamingTokens['viewTs'];
}

export interface IFeWithTypingAndNamingToken {

  feTypingAndNamingToken: IFeAbstractTypingAndNamingTokens;  // change the type in an override manner
}

declare namespace globalThis {
  var feTypingAndNamingTokens: IFeAbstractTypingAndNamingTokens;  // var is important; in a normal scenario is redeclared in fevmi/default-typing-and-naming.ts
}

// will only be actually instantiated by fevmi/default-typing-and-naming.ts or the consumer app


export type _NID = typeof feTypingAndNamingTokens['coreTs']['NID'] extends unknown //  @TODO review wrt frankie
  ? string
  : typeof feTypingAndNamingTokens['coreTs']['NID'];


export const feCoreIngressDefaults: Omit<
  IFeAbstractTypingAndNamingTokens['defaults'],
  'renderNothing' | 'groupPropName' | 'groupedStrandLabel'
> = {
  keyPropName: feTypingAndNamingTokens?.defaults?.keyPropName || 'id',
  strandLabel: feTypingAndNamingTokens?.defaults?.strandLabel || 'myStrand',
};


type __FeIngressDefaults <T> = typeof feTypingAndNamingTokens['defaults'];

// the below items are not called Usedbyapp due to that ingress renaming is an edge case and so these are default defaults

export type _FeDefaultKeyPropName<T = any> =
  __FeIngressDefaults<T>['keyPropName'] extends string
  ? __FeIngressDefaults<T>['keyPropName']
  : 'id'
  ;
export type __FeKeyPropName<StringKeyPropName extends string | undefined> =
  StringKeyPropName extends string
  ? StringKeyPropName
  : _FeDefaultKeyPropName
  ;
export type _FeDefaultGroupPropName<T = any> =
  __FeIngressDefaults<T>['groupPropName'] extends string
  ? __FeIngressDefaults<T>['groupPropName']
  : 'group'
  ;
export type __FeGroupKey<_GroupKey extends string | undefined> =  // @TODO review this item
  _GroupKey extends string
  ? _GroupKey
  : _FeDefaultGroupPropName
  ;
/* export type _FeDefaultKeyofShape =
  typeof feTypingOptions.fevm.defaultKeyofShape extends string
  ? typeof feTypingOptions.fevm.defaultKeyofShape
  : 'feShape'
;
export type __FeShapeKey< _ShapeKey extends string|undefined> =
  _ShapeKey extends string
  ? _ShapeKey
  : _FeDefaultKeyofShape
;*/
