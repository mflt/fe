import type { _FeDefaultKeyPropName } from "../_integration/abstract-typing-and-naming.js";
import type {
  FeValuesCollection, IFeValue, FeShapesArray, FeShapesMap, IFeShape,
} from 'fe3/triplet';
import { FeStrandConfig } from "./strand.js";


export type FeValuesinStrand <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
> = FeValuesCollection<
  TValue,
  FeStrandConfig<TValue, TShape>['options']['valueIdKey'] extends any
    ? FeStrandConfig<TValue, TShape>['options']['valueIdKey']
    : _FeDefaultKeyPropName
> | null;  // non-defined-ness should be set explicitly

export type FeShapesinStrand <
  TValue extends IFeValue,
  TShape extends IFeShape<TValue> = IFeShape<TValue>,
> = (
  TShape extends { markers: { shapesAreWeakmap: true } }
    ?
    WeakMap<TValue, TShape>
    :
    TShape extends { markers: { shapesAreArray: true } } // Default FeShape is Map, unlike values
      ?
      FeShapesArray<TShape,
        Exclude<
          FeStrandConfig<TValue, TShape>['options']['valueIdKey'] extends any
            ? FeStrandConfig<TValue, TShape>['options']['valueIdKey']
            : _FeDefaultKeyPropName, undefined> // @TODO this does not seem to work, see MessagesBannerTemplateWc
        >
      :
      FeShapesMap<TShape>
  ) | null;  // non-defined-ness should be set explicitly

