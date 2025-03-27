import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState
} from 'react'
import { useDebounce, useDebouncedCallback } from 'use-debounce'
import { _feIsFunction } from '@mflt/_fe'
import {
  feSetupRectResizeObserverwithCb,
  type FeTrackedRectEl, type FeTrackedRectDims,
  type FeSetupRectResizeObserverwithCbReturnT, type FeSetupRectResizeObserverwithCbOptions
} from './feSetupRectResizeObserverwithCb'

export type WithMeasuredPeakHeightProps = React.PropsWithChildren & {
  rollingPeakHeight?: React.RefObject<number>,
  setPeakHeight?: React.Dispatch<React.SetStateAction<number>>,
  debounceDelay?: Parameters<typeof useDebounce>[1],
  // parentWidth?: number,
  // children?: any,
  // measuredElsRef: React.MutableRefObject<MeasurableEl[]>
  // @TODO add style option
}


export const usePeakHeightObserverOutlet = (  //
  options?: FeSetupRectResizeObserverwithCbOptions & {
    parentelRef?: React.RefObject<HTMLDivElement|null>,
  }
) => {  // @TODO Arrays of content only, similar width!
  // const { measuredElsRef: measuredElsRef } = props
  const {
    parentelRef = null,
    ..._options
  } = options || {}
  const measuredElsSet = useRef(new WeakSet<FeTrackedRectEl>()) // @TODO reset is not managed
  const resizeObserversSetupResultsMap = useRef(new Map<FeTrackedRectEl, FeSetupRectResizeObserverwithCbReturnT>()) // @TODO reset is not managed
  const recordedDims = _options.recordedDims || useRef<FeTrackedRectDims>({width: 0, height: 0})
  const rollingRecordedWidth = useRef<number>(0)
  const rollingPeakHeight = useRef<number>(0)

  useEffect(() => {
    // cleanup on dismount:
    return () => resizeObserversSetupResultsMap.current.forEach?.(res => res?.disconnect())
  }, [resizeObserversSetupResultsMap.current, measuredElsSet.current])

  useEffect(() => { // @TODO does not work (?)
    if (!!parentelRef?.current /* || !rollingPeakHeight */)
      parentelRef.current.style.height = String(rollingPeakHeight.current);
  }, [rollingPeakHeight.current, parentelRef])

  const setupResizeObserverforEl = useCallback((
    el: FeTrackedRectEl,
    idx: number|string,
    options?: FeSetupRectResizeObserverwithCbOptions, // mind that partent also has options
  ) => {
    const mergedOptions = Object.assign({},
      _options,
      {recordedDims},
      options
    )
    if (!el || !_feIsFunction(measuredElsSet.current?.has)) return null;
    if (resizeObserversSetupResultsMap.current.has(el)) return resizeObserversSetupResultsMap.current.get(el);

    measuredElsSet.current.add(el)
    const _setupRes = feSetupRectResizeObserverwithCb(
      el,
      ({width, height}) => {

        if (rollingRecordedWidth.current != Math.round(width)
          || rollingPeakHeight.current < Math.round(height)) {
          rollingPeakHeight.current = Math.round(height);
          rollingRecordedWidth.current = Math.round(width);
        }
    },
      mergedOptions
    )

    if (!!_setupRes)  resizeObserversSetupResultsMap.current.set(el, _setupRes);
    return _setupRes
  }, [resizeObserversSetupResultsMap.current, measuredElsSet.current])

  const usePeakHeight = useCallback(
    () => rollingPeakHeight.current
  , [])
  // debounceDelay is not needed, as rollingPeakHeight already changes by the clock

  return {usePeakHeight, setupResizeObserverforEl}
}


export const WithMeasuredPeakHeight = (props:
  WithMeasuredPeakHeightProps
) => { // @TODO test again
  const selfRef = useRef<HTMLDivElement|null>(null)
  const [width, height] = useWidthAndHeightofRef(selfRef, {debounceDelay: props?.debounceDelay || 0})
  // const [[width, height]] = useDebounce(_dims, props?.debounceDelay || 0)
  const [recordedWidth, setRecordedWidth] = useState<number>(0)

  useEffect(() => {
    if (width)
      setRecordedWidth(width)
  }, [width])

  useEffect(() => {
    if (!height || !width || !props.rollingPeakHeight) return // @TODO if checking rollingPeakHeight makes sense
    if (recordedWidth != width || props.rollingPeakHeight.current < height!) {
      props.rollingPeakHeight.current = height
      props.setPeakHeight?.(height)
    }
  }, [height, width, recordedWidth, props])

  // @TODO add style option
  return <div ref={selfRef}>
    {props.children}
  </div>
}

export const useWidthAndHeightofRef = (
  ref: React.RefObject<FeTrackedRectEl|null>,
  options?: FeSetupRectResizeObserverwithCbOptions
) => {
  const [dims, setDimensions] = useState([0, 0])

  useEffect(() => {
    const _setupRes = feSetupRectResizeObserverwithCb(
      ref.current,
      ({width, height}) => {
        setDimensions([ Math.round(width||0), Math.round(height||0) ])
      },
      options
    )
    // if (!ref?.current) return;
    // const resizeObserver = new ResizeObserver(() => {
    //   const { width, height } = ref?.current? ref.current.getBoundingClientRect() : {}
    //   setDimensions([ Math.round(width||0), Math.round(height||0) ])
    // });
    // resizeObserver.observe(ref.current) // @TODO RN thing are not measured here
    return () => _setupRes?.disconnect()   // @TODO check if works
  }, [ref])
  return dims
}
