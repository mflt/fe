import React from 'react'
import { debounce } from '@tamagui/use-debounce'
import { _feIsFunction } from '@mflt/_fe'

export type FeTrackedRectEl = Parameters<ResizeObserver['observe']>[0] /*| typeof View*/
export type FeTrackedRectDims = Pick<DOMRect, 'width'|'height'>
export type FeSetupRectResizeObserverwithCbOptions = {
  recordedDims?: React.RefObject<FeTrackedRectDims>,  // will be rounded
  debounceDelay?: Parameters<typeof debounce>[1],
  callCbEvenwithZeros?: boolean,
  callCbEvenifUnchanged?: boolean,
}
export type FeSetupRectResizeObserverwithCbReturnT = {
  trackedEl: FeTrackedRectEl,
  resizeObserver: ResizeObserver,
  disconnect: ResizeObserver['disconnect'],
}

export function feSetupRectResizeObserverwithCb (
  trackedEl: FeTrackedRectEl|null,
  cb: (dims: FeTrackedRectDims, ...rest: Parameters<ResizeObserverCallback>) => void, // dims not rounded, but debounced
  options?: FeSetupRectResizeObserverwithCbOptions, // recordedDims rounded and not debounced
): FeSetupRectResizeObserverwithCbReturnT|null {
  // @TODO input checks
  if (!trackedEl) return null;
  if (!_feIsFunction(cb)) return null;
  const cbDebounced = debounce(cb, options?.debounceDelay || 0) // useDebouncedCallback(cb, options?.debounceDelay || 0)
  const resizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {

      const { width, height } = trackedEl.getBoundingClientRect()
      if ((!height || !width) && !options?.callCbEvenwithZeros) return; // @TODO
      if (options?.recordedDims?.current) {
        if (!options.callCbEvenifUnchanged
          && options.recordedDims.current.width === Math.round(width)
          && options.recordedDims.current.height === Math.round(height)
        ) return; // @TODO
        options.recordedDims.current.width = Math.round(width)
        options.recordedDims.current.height = Math.round(height)
      }
      cbDebounced({width,height}, entries, observer)
    }
  )

  resizeObserver.observe(trackedEl) // ResizeObserverOptions are useless
  const disconnect = () => {
    // @TODO 
    // if (!trackedEl) resizeObserver.disconnect()
    // else resizeObserver.unobserve(trackedEl)
    // cbDebounced.cancel()  // @TODO does not seem to have effect, it works, but works without it as well
  }
  return {trackedEl, resizeObserver, disconnect}
}
