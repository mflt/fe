import {
  _feIsFunction, _feIsObject, _feIsString,
} from 'fe3';
import { getElPositionbyLocation, } from 'fevmi';
import {
  $fu, FuEAtKindlabelSeparator, FuEAtSubspaceSeparator, FuEFeedKey, FuEViewKey,
} from './strings.js';
import type {
  FuComponentsUnitProps_Base, FuViewLocation, FuFeedResourceidLike, FuViewResourceidLike,
} from './types.js';
import type { FuAnyComponent } from '../fragment.js';
import { fuIsValidPosition } from './probes.js';


// Component misc:

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


// Unit [$fu] field in components (fragments and singles):

export function fuHasUnitField <  // @TODO field?
  UnitFieldShape extends FuComponentsUnitProps_Base = FuComponentsUnitProps_Base
> (
  component: FuAnyComponent<UnitFieldShape>,
) : component is FuAnyComponent<UnitFieldShape> {
  return $fu in component && _feIsObject(component[$fu]); // it actually does not guarantee that the shape is there, only that the field is there; the shape assertion is for ts
}

export function fuGetUnitField <
  UnitFieldShape extends FuComponentsUnitProps_Base = FuComponentsUnitProps_Base
> (
  component: FuAnyComponent<UnitFieldShape>,
) {
  return fuHasUnitField(component) ? component[$fu] as UnitFieldShape : undefined;
}

export function fuSetPropinUnitField <
  PropKey extends keyof UnitFieldShape,
  UnitFieldShape extends FuComponentsUnitProps_Base = FuComponentsUnitProps_Base,
> (
  component: FuAnyComponent<UnitFieldShape>,
  key: PropKey,
  value: UnitFieldShape[PropKey]
) {
  if (fuHasUnitField<UnitFieldShape>(component)) {
    component[$fu][key] = value;
    return true;
  }
  return false;
}


export function fuGetViewofComponent (
  component: FuAnyComponent,
) {
  const viewGetter = fuGetUnitField(component)?.getView;
  if (!_feIsFunction(viewGetter)) {
    return null;
  }
  return viewGetter();
}


export function fuAssignUnitField <
  UnitFieldShape extends FuComponentsUnitProps_Base = FuComponentsUnitProps_Base
> (
  component: FuAnyComponent<UnitFieldShape>,
) : component is FuAnyComponent<UnitFieldShape> {
  if (!fuHasUnitField(component)) {  // then checking isFragment is not necessary, that has is with at least {}
    Object.assign(component, {
      [$fu]: {} as FuComponentsUnitProps_Base, // @TODO consider not adding the field at all if not needed
      // should be the same as in Fragment
    });
    return true;
  }
  return false;
}


// Position/Location:

export function fuPlaceViewatPosition (
  component: FuAnyComponent,
  locationOrPositionOrSelector?: Parameters<typeof fuToViewLocation>[0],
  skipComputing?: boolean,
  finalFallback?: HTMLElement,
) : HTMLElement|null {
  const element = fuGetViewofComponent(component);
  if (element) {
    let positiontoGo: HTMLElement|null = locationOrPositionOrSelector
      ? computePositionbyLocation(fuToViewLocation(locationOrPositionOrSelector))
      : null;
    if (!positiontoGo) {
      if (skipComputing) {
        return null;
      }
      positiontoGo = computePositionbyLocation(fuGetUnitField(component)?.computableLocation) || finalFallback || null;
    }
    if (!fuIsValidPosition(positiontoGo)) {  // if the gonnabe parent has no parent or fragment that means it will not work with appendChild
      return null;
    }
    if (positiontoGo === element.parentNode) { // skip reattaching
      return element!.parentNode as HTMLElement;
    }
    positiontoGo.append?.(element); // after the above probing it's assumed to work as expected
    fuSetPropinUnitField<'position'>(component,'position', positiontoGo);
    return positiontoGo;
  } else {
    return null;
  }
}


export const fuToViewLocation = (
  locationOrPositionOrSelector?: FuViewLocation | HTMLElement | FuViewLocation['selectortoQuery'], // initial locationOrPositionOrSelector actually
  fallback?: FuViewLocation,
) : FuViewLocation|undefined =>
  !!locationOrPositionOrSelector
  ? _feIsString(locationOrPositionOrSelector)
    ? {
      selectortoQuery: locationOrPositionOrSelector,
      fallback
    } as FuViewLocation
    : _feIsObject(locationOrPositionOrSelector)
      ? locationOrPositionOrSelector instanceof HTMLElement
        ? {
          position: locationOrPositionOrSelector,
          fallback
        } as FuViewLocation
        : locationOrPositionOrSelector as FuViewLocation
      : undefined
  : undefined
;

export function computePositionbyLocation (  // effectively we locate the parent (ParentNode) to attach to this way, but can be any view (HTMLElement)
  location: FuViewLocation|undefined,
) : HTMLElement|null {
  if (!location) {
    return null;
  }
  const position = getElPositionbyLocation(location);
  if (position) { // @TODO check if HTMLElement
    return position;
  }
  if (!location.skipFallback && _feIsObject(location.fallback)) {
    return computePositionbyLocation(location.fallback);
  }
  return null;
}
