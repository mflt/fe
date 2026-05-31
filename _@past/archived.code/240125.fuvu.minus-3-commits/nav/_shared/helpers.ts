import { _feIsObject, _feIsString } from 'fe3';
import { getElbyLocation, } from 'fevmi';
import {
  $fu,
  FuEAtKindlabelSeparator, FuEAtSubspaceSeparator, FuEFeedKey, FuEViewKey,
} from './strings.js';
import type {
  FuComponentsUnitProps_Base, FuViewLocation, FuFeedResourceidLike, FuViewResourceidLike,
} from './types.js';
import type { FuAnyComponent } from '../fragment.js';


// see also FuComponentsFqIdsfromNames
export const fuComponentIdfromName = <
  ComponentsRecordLrIdString extends string,  // not a union of valid strings but the only string applicable which is used in constructing long right Rid-s
> (
  componentName: string,  // which is key from the pov of the components record (aka sub) object  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors
  subspaceId: ComponentsRecordLrIdString, // @TODO anchor
)=> componentName + FuEAtSubspaceSeparator + subspaceId
;

// see also _FuCombineResourceidsforFixedKind
export const fuResourceIdfromComponentId = (
  kind: FuEFeedKey|FuEViewKey,
  componentId: string,  // fq assumed, see componentIdfromName
): typeof kind extends FuEFeedKey ? FuFeedResourceidLike : FuViewResourceidLike =>
  `${kind as typeof kind extends FuEFeedKey ? FuEFeedKey : FuEViewKey}${FuEAtKindlabelSeparator}${componentId}`
;


export function fuHasUnitField ( // @TODO field?
  component: FuAnyComponent,
): component is FuAnyComponent & { [$fu]: FuComponentsUnitProps_Base } {
  return $fu in component && _feIsObject(component[$fu]);
}

export function fuGetUnitField (
  component: FuAnyComponent,
) {
  return fuHasUnitField(component) ? component[$fu] : undefined;
}

export function fuAssignUnitField (
  component: FuAnyComponent,
) {
  if (!fuHasUnitField(component)) {  // then checking isFragment is not necessary, that has is with at least {}
    Object.assign(component, {
      [$fu]: {} as FuComponentsUnitProps_Base, // @TODO consider not adding the field at all if not needed
      // should be the same as in Fragment
    });
  }
}


export const fuToViewLocation = (
  locationOrSelector?: FuViewLocation | FuViewLocation['selectortoQuery'], // initial locationOrSelector actually
) : FuViewLocation|undefined =>
  !!locationOrSelector
  ? _feIsString(locationOrSelector)
    ? {
      selectortoQuery: locationOrSelector
    } as FuViewLocation
    : _feIsObject(locationOrSelector)
      ? locationOrSelector as FuViewLocation
      : undefined
  : undefined
;

export const getViewbyLocation = (  // effectively we locate the parent (ParentNode) to attach to this way, but can be any view (HTMLElement)
  location: FuViewLocation,
) : HTMLElement|null => {
  const el = getElbyLocation(location);
  if (el) { // @TODO check if HTMLElement
    return el;
  }
  if (!location.skipFallback && _feIsObject(location.fallback)) {
    return getViewbyLocation(location.fallback);
  }
  return null;
}
