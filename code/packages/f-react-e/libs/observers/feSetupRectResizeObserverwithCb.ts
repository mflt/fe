import React from 'react'

export type FeTrackedRectEl = HTMLDivElement /*| typeof View*/ | null
export type FeTrackedRectDims = Pick<DOMRect, 'width'|'height'>

export function feSetupRectResizeObserverwithCb (
  trackedEl: FeTrackedRectEl,
  cb: (dims: FeTrackedRectDims) => void,
  recordedDims?: React.RefObject<FeTrackedRectDims>,
) {
  // @TODO input checks
  const resizeObserver = new ResizeObserver(() => {

    const { width, height } = (trackedEl as HTMLElement)!.getBoundingClientRect()
    if (!height || !width) return; // @TODO 
    if (recordedDims?.current) {
      if (recordedDims.current.width === Math.round(width)
        && recordedDims.current.height === Math.round(height) 
      ) return; // @TODO
      recordedDims.current.width = Math.round(width)
      recordedDims.current.height = Math.round(height) 
    }
    cb?.({width,height})
  })
  resizeObserver.observe(trackedEl as HTMLElement) 
  return trackedEl
}