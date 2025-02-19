import type { _DefineProperty } from '../core-types/constructor.types.js';

export const _isType = <Type>(thing: unknown): thing is Type => true;
// * https://stackoverflow.com/questions/51528780/typescript-check-typeof-against-custom-type

// https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
export function _applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
        Object.create(null)
      );
    });
  });
}

export function _defineProperty <
  Obj extends object,
  Key extends PropertyKey,
  PDesc extends PropertyDescriptor
> (
  obj: Obj,
  prop: Key,
  val: PDesc
): asserts obj is Obj & _DefineProperty<Key, PDesc>
{
  Object.defineProperty(obj, prop, val);
}
