import React, { 
  useCallback, useEffect, useLayoutEffect, useRef, useState 
} from 'react'
import { useDebounce } from 'use-debounce'
// import type { View } from 'tamagui'
import { 
  feSetupRectResizeObserverwithCb, 
  type FeTrackedRectEl, type FeTrackedRectDims 
} from './feSetupRectResizeObserverwithCb'

export type WithMeasuredPeakHeightProps = React.PropsWithChildren & {
  rollingPeakHeight?: React.MutableRefObject<number>, // @TODO MutableRefObject vs React 19
  setPeakHeight?: React.Dispatch<React.SetStateAction<number>>,
  debounceDelay?: Parameters<typeof useDebounce>[1],
  // parentWidth?: number,
  // children?: any,
  // measuredElsRef: React.MutableRefObject<MeasurableEl[]>
  // @TODO add style option
}


export const usePeakHeightObserver = (
  parentelfRef?: React.MutableRefObject<HTMLDivElement|null>
) => {  // @TODO Arrays of content only, similar width!
  // const { measuredElsRef: measuredElsRef } = props
  const measuredElsSet = useRef(new WeakSet<Exclude<FeTrackedRectEl,null>>()) // @TODO reset is not managed
  const recordedDims = useRef<FeTrackedRectDims>({width: 0, height: 0})
  const _recordedWidth = useRef<number>(0)
  // const [recordedWidth, setRecordedWidth] = useState<number>(_recordedWidth.current)

  // const observersTracker = useRef(new Map<string,MeasurableEl>())
  // const parentselfRef = useRef<HTMLDivElement|null>(null)
  // const [rollingPeakHeight, setRollingPeakHeight] = useState<number>(0)
  const _rollingPeakHeight = useRef<number>(0)
  // const [measuredContentEl, setMeasuredContentEl] = useState<typeof props['measuredElsRef']['current'][0] | null>(
  //   measuredElsRef.current[0]
  // )
  // const [width, height] = useWidthAndHeightofRef({el: measuredContentEl})
  // const [recordedHeight, setRecordedHeight] = useState(0)
  // const [dimensions, setDimensions] = useState([0, 0])

  useEffect(() => { // @TODO does not work
    if (!parentelfRef || !parentelfRef.current /* || !rollingPeakHeight */) return
    // console.log('PARENT H', rollingPeakHeight)
    parentelfRef.current.style.height = String(_rollingPeakHeight.current)
  }, [_rollingPeakHeight, /* rollingPeakHeight, */ parentelfRef, /* recordedWidth */])

  // useEffect(() => setRecordedWidth(_recordedWidth.current), [_recordedWidth.current])

  const setupResizeObserverforEl = useCallback((
    el: FeTrackedRectEl,
    idx: number|string
  ) => {
    // if (measuredElsSet.current.has(el!)) {
    //   console.log('HOOK NO-PUSH', idx, 'stored', !!el)
    //   return el
    // }
    if (!el || measuredElsSet.current.has(el)) return el
    measuredElsSet.current.add(el)
    // console.log('HOOK PUSHED', idx, !el && measuredElsSet.current.has(el)? 'stored' : el)
    // measuredElsRef.current[idx] = el
    // console.log('HOOK ADDING')
    // setMeasuredContentEl(el)
    feSetupRectResizeObserverwithCb( 
      el,
      ({width, height}: FeTrackedRectDims) => {

        if (_recordedWidth.current != Math.round(width) || _rollingPeakHeight.current < Math.round(height)) {
          _rollingPeakHeight.current = Math.round(height)
          // setRollingPeakHeight(_rollingPeakHeight.current)
          // console.log('HOOK OBSERVING HEIGHT rec width', recordedWidth, Math.round(width))
          _recordedWidth.current = Math.round(width)
          // setDimensions([_recordedWidth.current, _rollingPeakHeight.current])
          // setRecordedWidth(_recordedWidth.current) // has no effect in this context it seams
          // setRecordedHeight(height)
          // props.setPeakHeight?.(height)
        }
      // setDimensions([ Math.round(width), Math.round(height) ])
      },
      recordedDims
    )

    return el
    // return () => {
    //   measuredElsSet.current.delete(el) // @TODO
    //   // resizeObserver.disconnect()
    // }
  }, [])

  const usePeakHeight = useCallback(() => _rollingPeakHeight.current, [])

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
  ref: React.MutableRefObject<FeTrackedRectEl>
) => {
  const [dimensions, setDimensions] = useState([0, 0])

  useEffect(() => {
    if (!ref?.current) return
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = ref?.current? ref.current.getBoundingClientRect() : {}
      // console.log('OBSERVING REF HOOK H', height)
      setDimensions([ Math.round(width||0), Math.round(height||0) ])
    });
    resizeObserver.observe(ref.current) // @TODO RN thing are not measured here
    return () => resizeObserver.disconnect()
  }, [ref])
  return dimensions
}
