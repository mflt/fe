import type {
  __NID, _Fe_AnyI, _Fe_AnyI_theOther, FeStringKeyedCollectionObject,
} from '../core-types/root.types.js';
import type {
  FeValuesAnyIterable, IFeValue, /* IFeValueShade,*/ FeValuesCollection, FeShadesEntryComputer
} from '../core-types/value.i-f.js';
import {
  _feIsArray, _feIsFunction, _feIsIterable, _feIsMap, _feIsObject, _feAssertIsIterable,
} from '../probes/probes.js';
import {
  type FeMapLikeCollectionObject, $fe
} from '../collections/collections.js';


type IFeValueShade <T extends _Fe_AnyI> = IFeValue<T> // @TODO about it, also entrycomputer

export function _feMakeRecordFeMapLike <
  T extends Record<string,any>  // @TODO unknown instead of any?
> (
  self: Record<string,any>  // @TODO ...
): asserts self is FeMapLikeCollectionObject<T> {
  ponyfillIterableonKeyedObject(
    self, {
      iteratorSourceCollection: null,
      doIterateonKeys: true
  })
}


export const ponyfillIterableonKeyedObject = <
  TSelfValueOrShade extends IFeValue<_Fe_AnyI> | IFeValueShade<_Fe_AnyI> = IFeValue<_Fe_AnyI>,
  //* Any object or tuple (not implemented). The assumed current target is Record in terms of TS utility types.
  //* In FeVM the assumed type is rather TValueShade/TShape rather than TValue,
  //* but should also work with TValues, hence the definition.
  //* In case of this being a FeVM shade piggy-tailing a FeVM value,
  //* they are not necessarily in the strict relationship used in types.value-shape declarations.
  TIteratorSource extends IFeValue<_Fe_AnyI_theOther> | undefined | null = undefined,
  //* check out the comment at FeShadesEntryComputer
  KeyPropType extends string = string,
  TYieldedEntry extends TSelfValueOrShade = TSelfValueOrShade,
  //* The crafted iterator may return/yield an arbitrary type,
  //* which is by default the type of pyl in a self collection entry
> (
  self: FeStringKeyedCollectionObject<TSelfValueOrShade, KeyPropType>,
  //* The self/this, a collection on which the iterator is applied, potentially iterable but not effectively,
  //* currently eq Record<string,TValue/TValueShade>.
  //* If options.yieldedEntryComputer is employed then the self object can remain empty / virtual
  //* in terms of its content/entries/items, but the object itself has to exist.
  //* In case the self object is reset, the applied [Symbol.iterator] may get cleared, so this has to be reapplied.
  //* @TODO declare/infer that it has a key of 'id' or is a map which latter's 'id' drives the shades/shapes obj collection
  options?: {
    iteratorSourceCollection?:
      FeStringKeyedCollectionObject<Exclude<TIteratorSource, undefined | null>, KeyPropType> | null |
      FeMapLikeCollectionObject<Exclude<TIteratorSource, undefined | null>, KeyPropType> | null |
      FeValuesAnyIterable<Exclude<TIteratorSource, undefined | null>> | null,
    //* undefined implies to turn doIterateonKeys to true automatically,
    //* temporarily uninitialized and to be defined in the process iteratorSourceCollection should hold null.
    //* @TODO type this type
    //* @TODO this all only belongs to iterable Objects with key 'id' or <StringKeyPropName>
    idPropertyName?: string,
    getIteratorSourceCollection?: () => Exclude<typeof options, undefined>['iteratorSourceCollection']
    doIterateonKeys?: boolean,
    //* If true then the base iterator is Object.keys(self) in case iteratorSourceCollection is not provided,
    //* otherwise Object.keys(iteratorSourceCollection) are used for iterating.
    //* When used together with the yieldedEntryComputer option, then the 'sourceEntry' of the latter is null,
    //* shadesOrSelf entry, so the actual collection entry
    yieldedEntryComputer?: FeShadesEntryComputer<
      TSelfValueOrShade | Exclude<TIteratorSource, null | undefined>, // Could've been specific but would that help?
      TYieldedEntry,
      KeyPropType
    >,
    //* Supports generating a full usable yielded result (entry) (in the FeVM world presumably a shade/shape entry)
    //* for virtual (hence computed) content of self (shades/shapes).
    //* Also provide this if we're iterating on keys of iteratorSourceCollection and use those entries,
    //* not the entries of self (otherwise the entries of self are returned using the iteratorSourceCollection keys.
    iteratorSourceYieldedResultDeconstuctor?: (pyl: unknown) => [KeyPropType, Exclude<TIteratorSource, null | undefined>],
    filterKeysPredicater?: (value: string, index: number) => boolean, // typeof Array.prototype.filter/predicateFn
    sortKeysComparer?: (a: string, b: string) => number, // typeof Array.prototype.sort/compareFn
    //* filter performs first
    dontEquipwithMaplikeMethods?: boolean,  // object type selves are equipped with has/get/set/delete/clear by default
    _logRef?: string,
  }
) /*: boolean*/ => {
  // The factory:
  type _TIteratorSource = Exclude<TIteratorSource, null | undefined>;
  type _NextPropPyl = { key: KeyPropType | undefined };
  type _NextProp = [_NextPropPyl] | [];
  type _SelfIterator = Iterator<
    TYieldedEntry | null,
    TYieldedEntry | undefined,
    _NextPropPyl | undefined
  >;
  const {
    // idPropertyName = 'id', // see StringKeyPropName in FeVM, @TODO implement with Array
    yieldedEntryComputer,
    iteratorSourceYieldedResultDeconstuctor,
    _logRef = 'undefined case',
  } = options || {};
  const logPrelude = `[FE/Iterator factory] could not apply shade/shape with iterator for ${_logRef}:`
  { // Factory time checks:
    if (!self) {
      console.warn(`${logPrelude} self (target/wannabe iterator holder) is undefined`);
    }
    if (options?.getIteratorSourceCollection && !_feIsFunction(options.getIteratorSourceCollection)) {
      console.warn(`${logPrelude} getIteratorSourceCollection is not a function but defined`);
    }
    if (yieldedEntryComputer && !_feIsFunction(yieldedEntryComputer)) {
      console.warn(`${logPrelude} yieldedEntryComputer is not a function but defined`);
    }
    if (iteratorSourceYieldedResultDeconstuctor && !_feIsFunction(iteratorSourceYieldedResultDeconstuctor)) {
      console.warn(`${logPrelude} iteratorSourceYieldedResultDeconstuctor is not a function but defined`);
    }
  }
  let doIterateonKeys = options?.doIterateonKeys;
  const getIteratorSourceCollection: Exclude<Exclude<typeof options, undefined>['getIteratorSourceCollection'], undefined> =
    options?.getIteratorSourceCollection
    ||
    function() { return options?.iteratorSourceCollection; }
    ;
  const noUsableIteratorSourceCollection = options?.iteratorSourceCollection === undefined && options?.getIteratorSourceCollection === undefined;
  if (noUsableIteratorSourceCollection && !doIterateonKeys) {
    doIterateonKeys = true;
    console.log(`${logPrelude} iteratorSourceCollection is undefined so doIterateonKeys was set to true automatically (use null to indicate a temporary undefined state)`);
  }
  const fixedDoneResult = { value: undefined, done: true } as IteratorReturnResult<undefined>;
  const iteratorwithFixedDoneResult: Iterator<TYieldedEntry | null, TYieldedEntry | undefined> = {
    next: () => fixedDoneResult,
  };
  /*{
    console.warn("*** FACTORY", _logRef, "recs:", getIteratorSourceCollection?.(), "subj:", self)
  }*/

  // adding Map-like methods are the last part of the factory

  // The iterator constructor:
  (self as unknown as Iterable<TYieldedEntry | null>)[Symbol.iterator] = (): _SelfIterator => {
    const _iteratorSourceCollection = getIteratorSourceCollection?.();  // for allowing _iterationCollection redefine itself between uses
    // console.warn("*** Assigning shade iterator",_logRef) // ,_values)
    let sourceIterator: // eg. in Map api they call the map iterator object 'entries'
      TIteratorSource extends null | undefined // case of doIterateonKeys
      ? IterableIterator<string>
      : FeValuesCollection<_TIteratorSource> extends Map<__NID, _TIteratorSource>
      ? Iterator<_TIteratorSource | null, _TIteratorSource | undefined, { value: [__NID, _TIteratorSource] | null, done: true | false }>
      : Iterator<_TIteratorSource | null, _TIteratorSource | undefined, { value: _TIteratorSource | null, done: true | false }>
      ;
    try {
      { // Iterator constructor time checks:
        if (!self) {
          throw (`self (target/wannabe iterator holder) is undefined`);
        }
        if (!(doIterateonKeys || _feIsIterable(_iteratorSourceCollection))) {
          throw ('iteratorSourceCollection is not iterable while not iterating on keys either');
        }
      }
      if (!doIterateonKeys) {  // Note: no proper types checking below @TODO
        sourceIterator = (_iteratorSourceCollection as unknown as Iterable<TIteratorSource>)?.[Symbol.iterator]?.() as typeof sourceIterator;
      } else {
        let objectKeys = noUsableIteratorSourceCollection
          ? Object.keys(self)
          : Object.keys(_iteratorSourceCollection || {})
          ;
        if (!_feIsArray(objectKeys)) {
          throw ('no iterable keys for iterating on itself, ' + doIterateonKeys)
        }
        if (_feIsFunction(options?.filterKeysPredicater)) {
          objectKeys = objectKeys.filter(options!.filterKeysPredicater);
        }
        if (_feIsFunction(options?.sortKeysComparer)) {
          objectKeys = objectKeys.sort(options!.sortKeysComparer);
        }
        sourceIterator = objectKeys?.[Symbol.iterator]?.() as unknown as typeof sourceIterator;  
        // @TODO, unknown was recently added to get rid of the tsc error message
      }
      if (!_feIsFunction(sourceIterator.next)) {
        throw ('could not prepare source (values) or keys iterator');  // @TODO
      }
    } catch (err) {
      console.warn(`${logPrelude} ${err}`);
      return iteratorwithFixedDoneResult;
    }
    return {
      next(
        ...returnKey: _NextProp
      ): IteratorResult<TYieldedEntry | null, TYieldedEntry | undefined> {
        try {
          // Yielding checks:
          if (
            !(doIterateonKeys || _feIsIterable(_iteratorSourceCollection)) ||
            !(self || _feIsFunction(yieldedEntryComputer))
          ) {
            throw ('values source or shades/shapes themselves are undefined or not iterable');  // @TODO
          }
          const _baseIteration = sourceIterator?.next?.();
          if (!_baseIteration) {
            throw ('iterating values source / keys failed');  // @TODO
          }
          if (_baseIteration.done) {
            // console.warn('WE ARE DONE',_logRef)
            return fixedDoneResult;
          }
          // if (!_baseIteration.value) {
          //   console.warn(`${logPrelude} yielding undefined shade/shape (which is against the protocol)`)
          //   // @ts-ignore @TODO yielding undefined does not comply with the iterator protocol
          //   return {value: undefined, done:_baseIteration.done} as IteratorYieldResult<undefined>;
          // }
          let _ery: Parameters<typeof _getYieldingEry>[0];
          let _key: KeyPropType = '' as KeyPropType;

          if (doIterateonKeys) {
            _key = _baseIteration.value as KeyPropType;
            if (_feIsObject(returnKey?.[0])) {
              returnKey[0].key = _key;
            }
            // console.warn('WE have SELF id', _logRef, _id)
            return { // _id is not necessarily a string actually
              value: _getYieldingEry(
                null, // without yieldedEntryComputer it will return the self[_id] entry
                _key
              ),
              done: false
            }
          }
          // in the below cases the base iterator is the source collection
          // since if the self was iterable the whole thing had no use

          if (_feIsMap(_iteratorSourceCollection)) {
            [_key, _ery] = _baseIteration.value as [KeyPropType, _TIteratorSource];
            // console.warn('WE HAVE Map id', _logRef, _id, _ery)
            return {
              value: _getYieldingEry(_ery, _key),
              done: false
            }
          }

          if (_feIsArray(_iteratorSourceCollection)) {
            // Arrays of type [key,TYieldedEntry|null] are supported by default,
            // otherwise provide a converter to this format.
            _ery = _baseIteration.value as TSelfValueOrShade;
            // console.warn('WE HAVE Array el', _logRef, _ery)
            if (iteratorSourceYieldedResultDeconstuctor) {
              [_key, _ery] = iteratorSourceYieldedResultDeconstuctor(_ery);
            }

            /*else if (!idPropertyName) {
              throw('id property name was not defined');
            } else {
              // @TODO implement searching the item with the id
            }*/

            return {
              value: _getYieldingEry(_ery, _key),
              done: false
            }
          }

          throw ('only target keys case or source values in Map or Array are supported so far, sorry');

        } catch (err) {
          console.warn(`${logPrelude} ${err}`)
          return fixedDoneResult;
        }
      }
    }
  }

  function _getYieldingEry(
    iteratorSourceYieldedResult: Parameters<Exclude<typeof yieldedEntryComputer, undefined>>[0],
    key: KeyPropType | undefined,
    iterationIdx?: number
  ): TYieldedEntry | null {
    // console.warn(`____GETERY ${iteratorSourceYieldedResult +''+id}`)
    return yieldedEntryComputer
      ? yieldedEntryComputer(iteratorSourceYieldedResult, key, iterationIdx)
      : key
        ? (self as unknown as Record<KeyPropType, TYieldedEntry>)?.[key] || null
        : null
      ;
  }

  // add Map-like methods if allowed to:

  if (_feIsObject(self) && !options?.dontEquipwithMaplikeMethods && doIterateonKeys) {  // @TODO review conditions
    if (!(Object.getOwnPropertySymbols(self).includes($fe))) {
      // @ts-ignore
      (self as FeMapLikeCollectionObject<TSelfValueOrShade, KeyPropType>)[$fe] = {};
      // console.warn(logPrelude,"")
    }
    const maplikeMethods = (self as FeMapLikeCollectionObject<TYieldedEntry, KeyPropType>)[$fe]!; // or TYieldedEntry actually
    if (!maplikeMethods.has) {
      maplikeMethods.has = key => !!_getYieldingEry(null, key);
    }
    if (!maplikeMethods.get) {
      maplikeMethods.get = key => _getYieldingEry(null, key) || undefined;
    }

    if (!maplikeMethods.forEach) {  // forEach  @TODO fix that it does not work, see buiq signals 
      maplikeMethods.forEach = cb => {
        if (!_feIsFunction(cb)) {
          return;
        }
        const iteratorOfSelf = (self as unknown as Iterable<TYieldedEntry | null>)?.[Symbol.iterator]?.() as
          _SelfIterator;
        let _iteration = { value: null, done: false } as IteratorResult<TYieldedEntry | null, unknown> | undefined;
        let _returnKey: _NextPropPyl = { key: undefined };
        while (!!_iteration) {  // @TODO implement with a generator
          _iteration = iteratorOfSelf?.next?.(_returnKey);
          if (_iteration.done === true) {
            break;
          }
          cb(
            _iteration?.value,
            _returnKey.key
          );
        }
      }
    }

    if (yieldedEntryComputer) {
      return; // computed values have only getters here
    }
    if (!maplikeMethods.set) {
      maplikeMethods.set = (key, pyl) => {
        if (maplikeMethods.has?.(key)) {
          self[key] = pyl;
        }
        return self as ReturnType<Exclude<typeof maplikeMethods.set, undefined>>;
      }
    }
    if (!maplikeMethods.delete) {
      maplikeMethods.delete = key => {
        if (maplikeMethods.has?.(key)) {
          delete self[key];
          return true;
        }
        return false;
      }
    }
    if (!maplikeMethods.clear) {
      maplikeMethods.clear = () => {
        for (const key in self) {
          delete self[key];
        }
      }
    }
  }

};

export default {
  makeRecordFeMapLike: _feMakeRecordFeMapLike,
  makeKeyedObjectIterable: ponyfillIterableonKeyedObject
}