import {
  _feIsFunction, _feIsString, _feIsObject,
} from 'fe3';

export type FeElLocation_queryScript <
  PositionT = ReturnType<Document['querySelector']>
> =
  (that: FeElLocation<PositionT>, ...args: any[]) => PositionT
;

export type FeElLocation <
  PositionT = ReturnType<Document['querySelector']> // HTMLElement
> = {
  position?: PositionT, // directly defined (parent) node; see the wording in appendChild
  queryScript?: FeElLocation_queryScript<PositionT>,  // any more difficult query is to be coded
  selectortoQuery?: Parameters<Document['querySelector']>[0], // within the current shadow / blow slot
  queryinRoot?: ParentNode|Parameters<Document['querySelector']>[0], // assumed difference: obj vs string/String
  gueryinSlotNamed?: string, // on hop inside a named slot
}

export function getElPositionbyLocation < // note that ts returns Element from queries (covers SVG, XML, etc) so casting to HTMLElement might be necessary
  PositionT = ReturnType<Document['querySelector']>
> (
  location: FeElLocation<PositionT>,
  scriptArgs?: any[],
): PositionT|null {

  if (!!location.position) {
    return location.position;
  }
  if (location.queryScript) {
    if (_feIsFunction(location.queryScript)) {
      return location.queryScript(location, scriptArgs!==undefined? scriptArgs as any[] : undefined);
    } else {
      // @TODO log
      return null;
    }
  }
  if (!!location.selectortoQuery) {
    const queryinRoot: ParentNode|null = location.queryinRoot
      ?
      _feIsString(location.queryinRoot)
        ?
        document.querySelector(location.queryinRoot)
        :
        _feIsObject(location.queryinRoot) // @TODO check if ParentNode type below
          ? location.queryinRoot
          : document
      : document
    ;
    if (!queryinRoot) { // @TODO check if ParentNode type
      return null;
    }
    const scope = location.gueryinSlotNamed
      ? queryinRoot.querySelector(`slot[name=${location.gueryinSlotNamed}]`)
      : queryinRoot;
    if (!scope) {
      return null;
    }
    return scope.querySelector(location.selectortoQuery) as PositionT;
  } else {
    return null;
  }
}
