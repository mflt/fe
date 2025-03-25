// import { z, ZodObject } from 'zod'
import React, {
  type SetStateAction, lazy, Suspense,
  memo, useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback
} from 'react'
import { useDebounce } from 'use-debounce'
import {
  // isWindowDefined
  type View, isClient, XGroup, XStack, YStack,
} from 'tamagui'
import useEmblaCarousel from 'embla-carousel-react'
import EmblaCarouselFade from 'embla-carousel-fade'
// import EmbolaAutoHeight from 'embla-carousel-auto-height'
// import { ActiveCircle } from '../../../vendor-snap/tamagui.dev/components/ActiveCircle'
// import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons'
import { _feIsObject, _feIsArray, _feIsMap } from '@mflt/_fe'
import { WithMeasuredPeakHeight, useWidthAndHeightofRef, usePeakHeightObserver, type MeasurableEl } from '@mflt/f-react-e'

export type SlideContentBlock = React.JSX.Element|React.ReactNode|null
export type SlidesEntryHeadwPyl = {
  label: string
  pyl: {}
}
export type SlidesEntryHead = // aka Map's key
  | string | undefined
  | SlidesEntryHeadwPyl
// export type SlidesEntry = [string, SlideContentBlock]
export type SlidesEntriesMap <
  C extends SlideContentBlock = SlideContentBlock,  // value comes first, key type is optional
  K extends SlidesEntryHead = string
> = Map<K, C>
export type SlidesEntriesTupledArray <  // CodeHike Block
  C extends SlideContentBlock = SlideContentBlock,
  K extends SlidesEntryHead = string | undefined
> = Array<[K,C]>
export type SlidesEntriesChBlocksArray <  // CodeHike Block
  C extends SlideContentBlock = SlideContentBlock,
  K extends SlidesEntryHead = string | undefined
> = Array<{
  title?: string,
  children?: C  // @TODO slot
}>
export type SlidesEntriesCollection <
  C extends SlideContentBlock = SlideContentBlock,  // value comes first, key type is optional
  K extends SlidesEntryHead = string
> =
  | SlidesEntriesMap<C,K>
  | SlidesEntriesTupledArray<C,K>
  | SlidesEntriesChBlocksArray<C,K>

const wrapinRange = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

const selfFallBackWIDTH = 0
const carouselFallbackHEIGHT = '300px'  // @TODO

export type FeTamaBlocksSliderProps < // @TODO WIP!!!
  Collection extends SlidesEntriesCollection<C,K>,
  C extends SlideContentBlock = SlideContentBlock,  // value comes first, key type is optional
  K extends SlidesEntryHead = string
> = {
  contentEntriesCollection: Collection,
  options?: {
    css?: {
      slideContentBlock?: string,
      slideContentBlockTitle?: string,
      // @TODO minHeight ...
      carouselFallbackMinHeight?: string, // @TODO type
    },
    debounceDelay?: Parameters<typeof useDebounce>[1]
  },
  // children?: React.ReactNode
}


export function FeTamaBlocksSlider <
  Collection extends SlidesEntriesCollection,
  C extends SlideContentBlock = SlideContentBlock,  // value comes first, key type is optional
  K extends SlidesEntryHead = string
> (
  // @ts-ignore @TODO
  props: FeTamaBlocksSliderProps<Collection,C,K>
) {

  const {
    contentEntriesCollection,
    options: _options = {}
  } = props
  const { debounceDelay = 0, css: optionsCss = {} } = _options
  const isChBlocksCase = _feIsArray(contentEntriesCollection) && _feIsObject(contentEntriesCollection?.[0])
    && contentEntriesCollection?.[0]?.hasOwnProperty('children') && contentEntriesCollection?.[0]?.hasOwnProperty('title');
// @ts-ignore @TODO
  const contentEntriesArray: SlidesEntriesTupledArray<C,K>|null = _feIsMap(contentEntriesCollection)
    ? Array.from(contentEntriesCollection)
    : isChBlocksCase
      ? (contentEntriesCollection as SlidesEntriesChBlocksArray).map(ey => [ey.title, ey.children] )
      : _feIsArray(contentEntriesCollection) && _feIsArray(contentEntriesCollection[0])
        ? contentEntriesCollection as SlidesEntriesTupledArray
        : null
  const contentEntriesN = contentEntriesArray?.length || 0

  // const setPeakHeight = useDebouncedCallback(
  //   rollingPeakHeight => {
  //     _setPeakHeight?.(rollingPeakHeight)
  //   },
  //   50, // @TODO
  //   // The maximum time func is allowed to be delayed before it's invoked:
  //   { maxWait: 50 }
  // )
  // const slidesRefs = useRef<(HTMLDivElement | typeof View | null)[]>([])
  // const [peakContentHeight] = useMeasuredPeakHeight({
  //   contentRefs: slidesRefs
  // })

  const [scrollerRootRef, scrollerApi] = useEmblaCarousel({
    // watchResize: true
  }, [EmblaCarouselFade()])
  // const scrollViewRef = useRef<HTMLElement|null>(null)

  const [[pageIdx, going], goSetPage] = useState([0, 0])

  const _wrapinRange = useCallback((newIdx: number) => wrapinRange(0, contentEntriesN, newIdx), [contentEntriesN])

  const [activeEyIdx, setActiveIdx] = useState<number>(0)

  type Lock = null | 'shouldAnimate' | 'animate' | 'scroll' // From tamagui.dev theme scroller

  const updateActiveIdx = useCallback((
    newIdx: SetStateAction<number>,
    lock: Lock = 'shouldAnimate'
  ) => {
    const _newIdx = typeof newIdx === 'function' ? newIdx(activeEyIdx) : newIdx
    // * from tamagui.dev theme scroller, makes no sense here, yet
    const newActiveIdx = _wrapinRange(_newIdx)
    setActiveIdx(newActiveIdx)
    const going = newActiveIdx - pageIdx
    goSetPage([pageIdx + going /* aka newActiveIdx */, going])
    // scrollViewRef.current?.goToSlide?.(newActiveIdx)
    scrollerApi?.scrollTo(newActiveIdx)
  }, [activeEyIdx, pageIdx, _wrapinRange, scrollerApi])

  const paginate = useCallback((going: number) => {
    updateActiveIdx(
      pageIdx + going
    )
  }, [pageIdx, updateActiveIdx])

  const selfRef = useRef<HTMLDivElement|null>(null)
  const [selfWidth] = useWidthAndHeightofRef(selfRef) // tracks the wrappers's width
  const {usePeakHeight, setupResizeObserverforEl} = usePeakHeightObserver() // Actually works w/o it if used like usememo below
  const peakContentHeight = usePeakHeight()

  const [_selfWidth] = useDebounce(selfWidth, debounceDelay)
  const [_peakContentHeight] = useDebounce(peakContentHeight, debounceDelay)

  // const rollingPeakContentHeigh = useRef<number>(0)
  // const [_peakContentHeight, _setPeakHeight] = useState<number>(carouselHeightFALLBACK)

  // The core thing:
  // const CarouselFallback = <div style={{height: carouselHeightFALLBACK}} />

  // const slidesRefs = useRef<(HTMLDivElement | typeof View | null)[]>([])
  // const {rollingPeakHeight: peakContentHeight, setContentElEy: pushSlidesRef} = useMeasuredPeakHeight({

  // const stripRef = useRef<HTMLDivElement|null>(null)

  const Slides = useMemo(() => contentEntriesArray?.map(([head, slideContentBlock], idx) => {
    return (
      <div
        // 'slideNode'
        // @ts-ignore @TODO
        ref={(el: MeasurableEl) => setupResizeObserverforEl?.(el, idx)} // slidesRefs.current[idx] = el}
        key={`slide-${String('label')}-${idx}`}
        style={{
          // height: 500,
          // width: 400,
          flex: '0 0 100%',
          // alignItems: 'flex-start',
      }}>
        {/* <WithMeasuredPeakHeight
          setPeakHeight={setPeakHeight}
          rollingPeakHeight={rollingPeakContentHeigh}
          // parentWidth={_selfWidth}
        > */}
          {isChBlocksCase
            ?  slideContentBlock
            :
              <>
              {
                // @ts-ignore @TODO
                !!head?.title &&
                <h3
                  className={props?.options?.css?.slideContentBlockTitle}
                >
                  {
                    // @ts-ignore @TODO
                    head.title
                  }
                </h3>
              }
              <p className={props?.options?.css?.slideContentBlock}>
                {/*_peakContentHeight}:{_selfWidth*/}
                {slideContentBlock}<br/>
              </p>
              </>
          }
        {/* </WithMeasuredPeakHeight> */}
      </div>
    )
  }), [
    contentEntriesArray, _peakContentHeight, _selfWidth, setupResizeObserverforEl, isChBlocksCase
  ])

  const Carousel = useMemo(() => (false // !isClient || !_selfWidth
    ? <div
        // ref={stripRef}
        style={{
          // height: _peakContentHeight,
          display: 'flex',
      }}>
        {/* <div style={{backgroundColor: 'black', flex: '0 0 100%',}} ref={(el: MeasurableEl) => setupResizeObserverforEl?.(el, 0)}>
          {_peakContentHeight}::BLAHBLAH<br/>AAAA
        </div>
        <div style={{backgroundColor: 'black', flex: '0 0 100%',}} ref={(el: MeasurableEl) => setupResizeObserverforEl?.(el, 1)}>{_peakContentHeight}BOBAO<br/>AAAA<br/>sss</div> */}
      </div>
    : <div
        // 'scroller'
        ref={scrollerRootRef}
        onClick={() => paginate(1)}
        style={{
          height: _peakContentHeight,
          // width: 600,
          overflow: 'hidden',
          // backgroundColor: 'lightblue',
      }}>
        <div
          // slides strip (container)
          // ref={stripRef}
          style={{
            display: 'flex',
        }}>
          {Slides}
        </div>
      </div>
  ), [
    Slides, paginate, scrollerRootRef, _peakContentHeight /* _selfWidth setPeakHeight, */
  ])

  if (!contentEntriesCollection || !contentEntriesN) return (<div />) // @TODO <div />

  return <div
    onSuspend={()=><div style={{minHeight: optionsCss.carouselFallbackMinHeight /* @TODO */}} />} // @TODO Check if it works at all
  >
    <style>
      {`
        .scroll-horizontal {
          max-width: 100%;
          overflow-x: auto;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          /* Internet Explorer 10+ */
          scrollbar-width: none;
          /* Firefox */
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
          /* Safari and Chrome */
        }
      `}
    </style>
    <YStack
      // 'wrapper'
      ref={selfRef}
      my="$8" ai="center" jc="center" // bg='blue'
      width='100%'
      // height={_peakContentHeight}
      style={{
    }}>

      <XStack
        overflow="hidden"
        // backgroundColor="#000"
        position="relative"
        // height={_peakContentHeight}
        width='100%'
        alignItems="center"
      >
        {/* {memo(Carousel, [* _peakContentHeight,  setPeakHeight, * _selfWidth]) */}
        {Carousel }

      </XStack>

      <XStack className="scroll-horizontal no-scrollbar">
        <XStack
          px="$4"
          space="$2"
        >

          <XGroup disablePassBorderRadius p="$2" br="$10" als="center">
            {contentEntriesArray?.map(([head,], idx) => {
              const label = _feIsObject(head) // @TODO duplicated code
                ? (head as SlidesEntryHeadwPyl)?.label
                : head
              const isActive = activeEyIdx == idx
              return (
                <XGroup.Item key={`handle-${String(label)}${idx}`}>
                  <_TamaguiSite_ActiveCircle
                    onPress={() => updateActiveIdx(idx)}
                    isActive={isActive}
                    borderWidth={0}
                    backgroundColor={isActive? 'black' : label}
                  />
                </XGroup.Item>
              )
            })}
          </XGroup>
        </XStack>
      </XStack>

    </YStack>
  </div>
}


// tamagui.dev/components/ActiveCircle

import type { CircleProps } from 'tamagui'
import { Circle, /* YStack */ } from 'tamagui'

function _TamaguiSite_ActiveCircle (props: CircleProps & { isActive?: boolean }) {
  const { isActive, backgroundColor, opacity, ...rest } = props

  return (
    <YStack
      ai="center"
      jc="center"
      br="$10"
      borderColor="transparent"
      borderWidth={1}
      mx="$1"
      {...(isActive && {
        borderColor: '$color',
      })}
      {...(!isActive && {
        hoverStyle: {
          borderColor: '$color5',
        },
      })}
      {...rest}
    >
      <YStack
        br="$10"
        w={22}
        h={22}
        ai="center"
        jc="center"
        borderColor="transparent"
        cursor="pointer"
      >
        <Circle size={16} opacity={opacity} backgroundColor={backgroundColor} />
      </YStack>
    </YStack>
  )
}
