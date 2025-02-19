import { NID } from '../_shared/types.js';
// import { FeStatefulIdentity } from '../_shared/types.js';

export namespace FeStateful {
  export type IBranch = {
    app?: NID,
    space?: NID,
    window?: NID,
    scene?: NID,
  };
  export type TSpace = NID;
  export type TElement = NID;

  export type Binding <T extends {[P:string]:any} = any> = { // @TODO _IFe_any
    names: (keyof T)[],
    // identity?: FeStatefulIdentity,
  }
}