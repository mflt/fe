export type FeTrackedRectEl = HTMLDivElement /*| typeof View*/ | null
export type FeTrackedRectDims = Pick<DOMRect, 'width'|'height'>

export function feSetupRectResizeObserverwithCb (
  trackedEl: FeTrackedRectEl,
  cb: (dims: FeTrackedRectDims) => void
) {
  // @TODO input checks
  const resizeObserver = new ResizeObserver(() => {

    const { width, height } = (trackedEl as HTMLElement)!.getBoundingClientRect()
    if (!height || !width) return // @TODO 
    cb?.({width,height})
  })
  resizeObserver.observe(trackedEl as HTMLElement) 
  return trackedEl
}