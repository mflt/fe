import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState
} from 'react'
import { useDebounce, useDebouncedCallback } from 'use-debounce'
// import type { View } from 'tamagui'
import {
  feSetupRectResizeObserverwithCb,
  type FeTrackedRectEl, type FeTrackedRectDims,
  type FeSetupRectResizeObserverwithCbReturnT, type FeSetupRectResizeObserverwithCbOptions
} from './feSetupRectResizeObserverwithCb'

export type WithMeasuredPeakHeightProps = React.PropsWithChildren & {
  rollingPeakHeight?: React.RefObject<number>, // @TODO MutableRefObject vs React 19
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
  const measuredElsSet = useRef(new WeakSet<Exclude<FeTrackedRectEl,null>>()) // @TODO reset is not managed
  const resizeObserversSetupResultsSet = useRef(new Set<FeSetupRectResizeObserverwithCbReturnT>()) // @TODO reset is not managed
  const recordedDims = _options.recordedDims || useRef<FeTrackedRectDims>({width: 0, height: 0})
  const rollingRecordedWidth = useRef<number>(0)
  const rollingPeakHeight = useRef<number>(0)

  // const [recordedWidth, setRecordedWidth] = useState<number>(_recordedWidth.current)

  // const observersTracker = useRef(new Map<string,MeasurableEl>())
  // const parentselfRef = useRef<HTMLDivElement|null>(null)
  // const [rollingPeakHeight, setRollingPeakHeight] = useState<number>(0)
  // const [measuredContentEl, setMeasuredContentEl] = useState<typeof props['measuredElsRef']['current'][0] | null>(
  //   measuredElsRef.current[0]
  // )
  // const [width, height] = useWidthAndHeightofRef({el: measuredContentEl})
  // const [recordedHeight, setRecordedHeight] = useState(0)
  // const [dimensions, setDimensions] = useState([0, 0])

  useEffect(() => { // @TODO does not work
    if (!!parentelRef?.current /* || !rollingPeakHeight */)
      parentelRef.current.style.height = String(rollingPeakHeight.current);

    return () => {
      resizeObserversSetupResultsSet.current.forEach?.(res => res.disconnect()) // @TODO check if works
    }
  }, [rollingPeakHeight, /* rollingPeakHeight, */ parentelRef, /* recordedWidth */])

  // useEffect(() => setRecordedWidth(_recordedWidth.current), [_recordedWidth.current])

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
    if (!el || measuredElsSet.current.has(el)) return null;
    measuredElsSet.current.add(el)
    // measuredElsRef.current[idx] = el
    // setMeasuredContentEl(el)
    const _setupRes = feSetupRectResizeObserverwithCb(
      el,
      ({width, height}) => {

        if (rollingRecordedWidth.current != Math.round(width)
          || rollingPeakHeight.current < Math.round(height)
        ) {
          rollingPeakHeight.current = Math.round(height)
          // setRollingPeakHeight(_rollingPeakHeight.current)
          // console.log('HOOK OBSERVING HEIGHT rec width', recordedWidth, Math.round(width))
          rollingRecordedWidth.current = Math.round(width)
          // setDimensions([_recordedWidth.current, _rollingPeakHeight.current])
          // setRecordedWidth(_recordedWidth.current) // has no effect in this context it seams
          // setRecordedHeight(height)
          // props.setPeakHeight?.(height)
        }
        // setDimensions([ Math.round(width), Math.round(height) ])
      },
      mergedOptions
    )

    if (!!_setupRes)  resizeObserversSetupResultsSet.current.add(_setupRes);
    return _setupRes
    // return () => {
    //   measuredElsSet.current.delete(el) // @TODO
    //   // resizeObserver.disconnect()
    // }
  }, [])

  const usePeakHeight = useDebouncedCallback(() => rollingPeakHeight.current, _options?.debounceDelay || 0)
  // @TODO isn't it a dublication? ... tho the debounceDelay values in the ro callbacks may be different

  return {usePeakHeight, setupResizeObserverforEl}
}


export const WithMeasuredPeakHeight = (props:
  WithMeasuredPeakHeightProps
) => { // @TODO test again
  const selfRef = useRef<HTMLDivElement|null>(null)
  const _dims = useWidthAndHeightofRef(selfRef)
  const [[width, height]] = useDebounce(_dims, props?.debounceDelay || 0)
  const [recordedWidth, setRecordedWidth] = useState<number>(0)

  useEffect(() => {
    if (width)
      setRecordedWidth(width)
    // console.log('WIDH',width)
  }, [width])

  useEffect(() => {
    if (!height || !width || !props.rollingPeakHeight) return // @TODO if checking rollingPeakHeight makes sense
    if (recordedWidth != width || props.rollingPeakHeight.current < height!) {
      // console.log('TEXT higher',selfRef.current?.scrollHeight, props.runningPeakHeightRef.current)
      props.rollingPeakHeight.current = height
      // props.runningPeakHeightRef.current = height
      props.setPeakHeight?.(height)
      // console.log('HHH',height)
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
    return () => _setupRes?.disconnect   // @TODO check if works
  }, [ref])
  return dims
}
