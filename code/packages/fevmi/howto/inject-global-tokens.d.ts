// export {}

// see also:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
// https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html
// https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
// * declare module globalThis -- no
// One may also play with a global class and static scopes.

// 1)

declare namespace globalThis {
  var myNewGlobalProp: string;  // var is important
}

// 2)

declare namespace feTypingAndNamingToken {
  var coreTs: {
    NID: nanoid;
  }
}

// This will already serve for the typescript purposes of a cascade style of redefining types in upstream.
// For this to work in runtime you need to prepare the global feTypingAndNamingToken variable,
// in a browser case you could add
// <script>var feTypingAndNamingTokens;</script>
// to index.html before the relying bootstrapping code starts. Non module script scope and var are important.
//