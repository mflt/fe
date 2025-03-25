import React from 'react'

export type FeTrackedRectEl = Parameters<ResizeObserver['observe']>[0] /*| typeof View*/
export type FeTrackedRectDims = Pick<DOMRect, 'width'|'height'>

export function feSetupRectResizeObserverwithCb (
  trackedEl: FeTrackedRectEl,
  cb: (dims: FeTrackedRectDims) => void,
  recordedDims?: React.RefObject<FeTrackedRectDims>,
) {
  // @TODO input checks
  if (!trackedEl) return null;
  const resizeObserver = new ResizeObserver(() => {

    const { width, height } = trackedEl.getBoundingClientRect()
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
  resizeObserver.observe(trackedEl) // ResizeObserverOptions are useless
  return trackedEl;
}