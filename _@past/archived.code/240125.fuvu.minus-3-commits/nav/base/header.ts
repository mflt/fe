import { FuEUndefinedString, } from '../_shared/strings.js';
import { FuNavNodeModule, } from '../modules.js';


export type _FuNavNodeHeader <  // not unit header as it holds basic identity and tracking info of a node, however is plugged into the unit part
  UValidNodeLrIdString extends string,
> = {
  id: UValidNodeLrIdString|FuEUndefinedString;
  // status: FuNavNodeStatusStrings|undefined;
  isActive: boolean;
  module?: FuNavNodeModule;
}

export const fuEmptyNodeHeader = {
  header: {
    id: FuEUndefinedString,
    // status: FuNavNodeStatusStrings.Undefined,
    isActive: false,
    module: undefined,
  } satisfies _FuNavNodeHeader<string>
};

export class FuNavNodeHeader <
  UValidNodeLrIdString extends string,
>
  implements Exclude<_FuNavNodeHeader<UValidNodeLrIdString>,'id'>
{
  // header:
  #id!: _FuNavNodeHeader<UValidNodeLrIdString>['id'];
  get id () { return this.#id; }
  set id (id) { this.#id = id; }

  public isActive = fuEmptyNodeHeader.header.isActive as _FuNavNodeHeader<UValidNodeLrIdString>['isActive'];
  public module: _FuNavNodeHeader<UValidNodeLrIdString>['module'];  // undefined
}
