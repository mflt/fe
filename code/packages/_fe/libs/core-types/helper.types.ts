import type { FeTKeyof } from './root.types.js';

// see also: https://github.com/piotrwitek/utility-types
// not used for dependency avoiding reasons

export type _Never2Unknown <T> = [T] extends [never] ? unknown : T;

export type _PrefixLiteral<
  Prefix extends string,
  Names extends string
> = `${Prefix}${Names}`;

export type _PrefixLiteralwithSeparator <
  Prefix extends FeTKeyof,  // to allow keyof without extracting  @TODO why number or symbol are usable here?
  Names extends string,
  Separator extends string = '.'
> = `${Prefix extends string? Prefix & string : never}${Separator & string}${Names & string}` & string;


export type _RecordStringKeyed_Assert <R,RT> = Record<keyof R & string, RT>;

export type _ExtractTypesfromRecord <
  R extends Record<string,any>
> = R extends {[K in keyof R]: infer VT} ? VT : never;

export type _ExtractTypesUnionfromIndexed <T> = T extends Array<infer Item> ? Item : T; // aka Flatten
// * from https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types

export type _KeysofValueT <
  R extends Record<string,any>,
  PropValueT
> =
  {
    [K in keyof R]: R[K] extends PropValueT
      ? K
      : never;
  }[keyof R]
;
// https://www.totaltypescript.com/get-keys-of-an-object-where-values-are-of-a-given-type

// Gets keys of types matching a set of condition types provided as a tuple (avoid matching a merged type of types)
export type _KeysofValueTs <
  R extends Record<string,any>,
  PropValueTs extends any[]
> =
  _ExtractTypesUnionfromIndexed<{
    [PVIdx in keyof PropValueTs]:
      {
        [K in keyof R & string]: R[K] extends PropValueTs[PVIdx]
          ? K
          : never;
      }[keyof R & string]
  }> extends infer Keys ? Keys extends string ? Keys : never : never
;

export type _PickPropsofValueT <
  R extends Record<string,any>,
  PropValueT
> = Pick<R,_KeysofValueT<R, PropValueT>>;

export type _PickPropsofValueTs <
  R extends Record<string,any>,
  PropValueTs extends any[]
> = Pick<R,_KeysofValueTs<R, PropValueTs>>;

export type _GetKeys <T> = (
  T extends readonly unknown[]
    ? T extends Readonly<never[]>
      ? never
      : { [K in keyof T]-?: K }[number]
    : T extends Record<PropertyKey, unknown>
      ? { [K in keyof T]-?: K extends number | string ? `${K}` : never }[keyof T]
      : never
  )
;
// https://github.com/microsoft/TypeScript/issues/27995#issuecomment-1837565708

export type _TKeyofRecordT = keyof Record<string,any>|symbol;


export type _UnionToIntersection <U> = (U extends any
  ? (k: U) => void
  : never) extends (k: infer I) => void
  ? I
  : never
;
// https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts


// Rest:

/*
type _Validator<T extends boolean> =
  T extends true
    ? []
    : [never];
// * https://catchts.com/infer-arguments
*/

export type _UnreadonlifyConstEnum <T> = {
  -readonly [K in keyof T]: T[K] extends readonly (infer R)[] ? R[] : never
  // -readonly [K in keyof T]: T[K] extends readonly (infer R)[]? R[] extends Array<infer MT> ? Array<MT> : never : never
};
// * https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// * https://stackoverflow.com/questions/74895551/mutablet-works-only-when-theres-an-missing-type

export type _Branded <T,
  Brand extends string
> = T & {
  readonly __brand: Brand // @TODO could be a symbol
};  // @TODO is it zod compatible?

export type _UniquelyBranded <T,
  Brand extends string
> = T & {
  readonly [B in Brand as `__${B}_brand`]: never;
};
// *https://news.ycombinator.com/item?id=40146751

export type _BrandofBranded <T> = T extends { __brand: infer B } ? B : never
export type _WithAssertedBrand <T,
  Brand extends string
> = T extends { __brand: infer B } ? B extends Brand ? T : never  : never

export type CastSetTtoArrayTinRecord <T> = T extends Record<any,any>
  ? {
    [K in keyof T]: T[K] extends Set<infer ST> ? Array<ST> : T[K]
  }
  :
  T

export type CastArrayTtoSetTinRecord <T> = T extends Record<any,any>  // @TODO WIP
  ? {
    [K in keyof T]:
      T[K] extends {
        [I:string]: unknown
      }|undefined
      ? T[K] :
      T[K] extends Array<infer ST>|undefined
      ? Set<ST>|undefined :
      // T[K] extends Array<infer ST>
      // ? Set<ST> :
      T[K]
  }
  :
  T
