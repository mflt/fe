import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { WithMeasuredPeakHeight, type WithMeasuredPeakHeightProps, usePeakHeightObserver, type MeasurableEl } from '@mflt/f-react-e'
import type { 
  SlCarousel as FeShoelaceCarouselEl, 
  SlCarouselItem as FeShoelaceCarouselItem,
  SlSlideChangeEvent as FeShoelaceSlideChangeEvent
} from '@shoelace-style/shoelace'

// @TODO tailwind dependency
// @TODO Explain the transparent dependency on "@shoelace-style/shoelace": "latest"

export type { FeShoelaceCarouselEl, FeShoelaceCarouselItem, FeShoelaceSlideChangeEvent }

const selfWidthFALLBACK = 0
const carouselHeightFALLBACK = 120  // @TODO

export const FeShoelaceCarousel = (props: {
    contentItems: Array<React.JSX.Element>,
    carouselRef: React.RefObject<FeShoelaceCarouselEl|null>,
    carouselCssClass?: string,
    carouselItemCssClass?: string,
    orientation?: FeShoelaceCarouselEl['orientation']
  } & WithMeasuredPeakHeightProps
) => {

  const SlCarousel = lazy(() => import('@shoelace-style/shoelace/dist/react/carousel/index.js'))  // avoiding SSR incopmatibility with the client only sideeffects
  const SlCarouselItem = lazy(() => import('@shoelace-style/shoelace/dist/react/carousel-item/index.js'))
  const rollingPeakHeightRef = props.rollingPeakHeight || useRef<number>(0)
  const [peakContentHeight, _setPeakHeight] = useState<number>(carouselHeightFALLBACK)
  // const {usePeakHeight, setupResizeObserverforEl} = usePeakHeightObserver() // Actually works w/o it if used like usememo below
  // const peakContentHeight = usePeakHeight()

  if (!props) return null

  // @TODO Fallback
  return <>
    <style>
      {`
        .feDefaultShoelaceCarouselClass {
          background: transparent;
        }

        .feDefaultShoelaceCarouselClass::part(base) {
          background: transparent;
        }

        .feDefaultShoelaceCarouselClass::part(scroll-container) {
          background-color: transparent;
        }

        .feDefaultShoelaceCarouselClass::part(pagination) {}

        .feDefaultShoelaceCarouselClass::part(pagination-item) {}
      `}
    </style>
    <Suspense 
      fallback={<div>:)</div>}  // @TODO
    >
      <SlCarousel 
        ref={props?.carouselRef}
        className={ props.carouselCssClass ?? 'feDefaultShoelaceCarouselClass'}
        orientation={ props.orientation ?? 'vertical'}
        pagination={false} 
        style={{
          height: rollingPeakHeightRef.current
      }}>
        {props?.contentItems?.map((content,key) => (
          <SlCarouselItem key={key}>
            <WithMeasuredPeakHeight 
              setPeakHeight={props?.setPeakHeight || _setPeakHeight} 
              rollingPeakHeight={rollingPeakHeightRef}
            >
              <p // @TODO p?
                className={
                  props.carouselItemCssClass ??
                  'text-balance mx-auto flex items-center gap-2 text-center text-gray-100 font-normal text-[1.15rem] leading-[1.8rem]'
                }
              >
                {content}
              </p>
            </WithMeasuredPeakHeight>
          </SlCarouselItem>
        ))}
      </SlCarousel>
    </Suspense>
  </>  
}
