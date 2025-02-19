import type { _Branded, _BrandofBranded } from '../core-types/helper.types.js';

export const _feIsNumber = (num: number): num is number =>
  +num === +num;
export const _feIsString = (val: unknown): val is string|String =>
  typeof val === 'string' || val instanceof String;
export const _feIsMap = <K, V> (that: unknown): that is Map<K, V> =>
  that instanceof Map;
export const _feIsWeakMap = <K extends Object, V> (that: unknown): that is WeakMap<K, V> =>
  that instanceof WeakMap;
export const _feIsArray = <T> (that: unknown): that is Array<T> =>
  Array.isArray(that);
export const _feIsSet = <T> (that: unknown): that is Set<T> =>
  that instanceof Set;
export const _feIsObject = (that: unknown): that is Exclude< Object, Array<unknown>> =>
  that instanceof Object  // inherited also counts
  && !Array.isArray(that);
export const _feIsEmptyObject = (that: unknown): that is Record<string,never> =>
  that?.constructor === Object  // inherited doesn't count
  && Object.keys(that)?.length === 0  // could also be getOwnPropertyNames()
  && Object.getOwnPropertySymbols(that)?.length === 0;
  // JSON.stringify(that) === '{}';
export const _feIsNotanEmptyObject =
  (that: unknown): that is Exclude< Object, Array<unknown> | Record<string,never>> =>
    _feIsObject(that) && !_feIsEmptyObject(that);
export const _feIsFunction = (that: unknown): that is Function =>
  that instanceof Function; // @TODO all to unknown
export const _feIsAsyncFunction = <
  P = unknown,
  Args extends any[] = any[]
> (that: unknown): that is (...args: Args)=>Promise<P> =>
  that?.constructor?.name === 'AsyncFunction'; // @TODO return type ? probably done

export const _feIsIterable = <T> (that: unknown): that is Iterable<T> => (
  !!that
  && !!((that as Iterable<T>)[Symbol.iterator])
  && (that as Iterable<T>)[Symbol.iterator] instanceof Function  // @TODO review casting any or checking iterator otherwise
);

//* Also note that "actually calling next() and validating the returned result" should be the true test
//* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol
//* ... like the below:

export const _feIsIterableTest = <T> (that: unknown): that is Iterable<T> => {
  if (_feIsIterable(that)) {
    try {
      const iterator = (that as Iterable<T>)?.[Symbol.iterator]?.();
      if (iterator?.next?.() instanceof Object) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }
  return false;
};

export const _feIsofBrand = <T> (
  that: _Branded<T,string>,
  brand: string
): that is _Branded<T, typeof that['__brand']> => {
  return (that as _Branded<T,'_'>)?.__brand === brand
}

// With Assertion

type MessageinProps = {message: string}
type LabelOrMessage = string|MessageinProps

export function _feAssertIsDefined <T> (
  val: T,
  labelOrMessage?: LabelOrMessage
): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'value'} to be defined, but received ${val}`  // @TODO add stringify
    );
  }
}

export function _feAssertIsString (
  val: unknown,
  labelOrMessage?: string|{message: string}
): asserts val is string|String {
  if (!_feIsString(val)) {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'value'} to be a string, but received ${val}`
    );
  }
}

export function _feAssertIsObject (
  that: unknown,
  labelOrMessage?: string|{message: string}
): asserts that is Exclude< Object, Array<unknown>> {
  if (!(that instanceof Object) || Array.isArray(that)) {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'label'} to be an object, but received ${Array.isArray(that)? 'an array' : that}`
    );
  }
}

export function _feAssertIsSyncFunction <
  ReturnedValueT = unknown,
  Args extends any[] = any[]
> (
  that: unknown,
  labelOrMessage?: string|{message: string}
): asserts that is (...args: Args)=> Exclude< ReturnedValueT, Promise<unknown>> {
  if (
    !(that instanceof Function)
    || that?.constructor?.name === 'AsyncFunction'
  ) {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'label'} to be an sync funciton, but received ${that}`
    );
  }
}

export function _feAssertIsAsyncFunction <
  ReturnedValueT = unknown,
  Args extends any[] = any[]
> (
  that: unknown,
  labelOrMessage?: string|{message: string}
): asserts that is (...args: Args)=> Promise<ReturnedValueT> {
  if (that?.constructor?.name !== 'AsyncFunction') {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'label'} to be an async funciton, but received ${that}`
    );
  }
}

export function _feAssertIsIterable <T> (
  that: unknown,
  labelOrMessage?: string|{message: string}
): asserts that is Iterable<T> {
  if (_feIsIterable(that)) {
    throw new TypeError(
      (labelOrMessage as MessageinProps)?.message ||
      `Expected ${labelOrMessage || 'label'} to be iterable, but received ${that}`
    );
  }
}

export default {

  isNumber: _feIsNumber,
  isString: _feIsString,
  isMap: _feIsMap,
  isWeakMap: _feIsWeakMap,
  isArray: _feIsArray,
  isSet: _feIsSet,
  isObject: _feIsObject,
  isEmptyObject: _feIsEmptyObject,
  isNotanEmptyObject: _feIsNotanEmptyObject,
  isFunction: _feIsFunction,
  isAsyncFunction: _feIsAsyncFunction,
  isIterable: _feIsIterable,

  isIterableTest: _feIsIterableTest,

  isofBrand: _feIsofBrand,

  assertIsDefined: _feAssertIsDefined,
  assertIsString: _feAssertIsString,
  assertIsObject: _feAssertIsObject,
  assertIsSyncFunction: _feAssertIsSyncFunction,
  assertIsAsyncFunction: _feAssertIsAsyncFunction,
  assertIsIterable: _feAssertIsIterable,
} as {

  isNumber: typeof _feIsNumber,
  isString: typeof _feIsString,
  isMap: typeof _feIsMap,
  isWeakMap: typeof _feIsWeakMap,
  isArray: typeof _feIsArray,
  isSet: typeof _feIsSet,
  isObject: typeof _feIsObject,
  isEmptyObject: typeof _feIsEmptyObject,
  isNotanEmptyObject: typeof _feIsNotanEmptyObject,
  isFunction: typeof _feIsFunction,
  isAsyncFunction: typeof _feIsAsyncFunction,
  isIterable: typeof _feIsIterable,

  isIterableTest: typeof _feIsIterableTest,

  isofBrand: typeof _feIsofBrand,

  // this whole typing overhead is necessiated by TS2775
  assertIsDefined: typeof _feAssertIsDefined,
  assertIsString: typeof _feAssertIsString,
  assertIsObject: typeof _feAssertIsObject,
  assertIsSyncFunction: typeof _feAssertIsSyncFunction,
  assertIsAsyncFunction: typeof _feAssertIsAsyncFunction,
  assertIsIterable: typeof _feAssertIsIterable,
}
