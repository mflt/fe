// import { z, ZodObject } from 'zod'
import React, {
  type SetStateAction,
  useMemo, memo, useRef, useState, useEffect, useCallback, useId,
  JSX
} from 'react'
import {
  useSignal, useSignalEffect, type Signal
} from '@preact/signals-react'
// import ReactDOMServer from 'react-dom/server'
// import { useDebounce } from 'use-debounce'
import {
  // isWindowDefined
  /* type */ View, isClient, XGroup, XStack, YStack, styled,
  type TextProps, type ViewProps,
} from 'tamagui'
import type { Pointer } from '@tamagui/lucide-icons'
import useEmblaCarousel, {} from 'embla-carousel-react'
import EmblaCarouselFade from 'embla-carousel-fade'
// import EmbolaAutoHeight from 'embla-carousel-auto-height'
// import { ActiveCircle } from '../../../vendor-snap/tamagui.dev/components/ActiveCircle'
// import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons'
import { _feIsObject, _feIsArray, _feIsMap, _feIsFunction } from '@mflt/_fe'
import {
  type FeTrackedRectEl, type FeSetupRectResizeObserverwithCbOptions,
  useWidthAndHeightofRef, usePeakHeightObserverOutlet, // type FeTrackedRectEl
} from '@mflt/f-react-e'  // '../../../f-react-e/libs/observers/usePeakHeightObserver'
// import {
//   // type FeTrackedRectEl, type FeSetupRectResizeObserverwithCbOptions,
//   useWidthAndHeightofRef, usePeakHeightObserverOutlet, // type FeTrackedRectEl
// } from './UPHO'  // '../../../f-react-e/libs/observers/usePeakHeightObserver'


export type SlideContentBlock = React.JSX.Element|React.ReactNode|null
export type SlidesEntryHeadwPyl = {
  label: string
  pyl: {}
}
export type FeTamaBlocksSlidesEntryHead = { // @TODO merge with the above
  label: SlidesEntryHead|SlidesEntryHeadwPyl['label'],
  title?: string,
  icon?: typeof Pointer,
  color?: string, // badge/circle backgound
  textCls?: string,
  textProps?: TextProps,
  viewCls?: string,
  viewProps?: ViewProps,
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

export type FeTamaBlocksSliderPaginationItemProps =
  & FeTamaBlocksSlidesEntryHead
  & {
    idx: Parameters<Parameters<Array<any>['map']>[0]>[1],
    activeIdx: Signal<Parameters<Parameters<Array<any>['map']>[0]>[1]>,
}

export type FeTamaBlocksSliderPaginationItem = (props:
  & React.PropsWithChildren
  & FeTamaBlocksSliderPaginationItemProps
) => JSX.Element

const wrapinRange = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

const selfFallBackWidth__ = 0
const carouselFallbackHeight__ = '200px'  // @TODO
const defaultSlideMeCtaColor__ = 'hsla(105 100% 79% / 0.99)'

type _classNameString = string

export type FeTamaBlocksSliderStyling = {
  slideContentBlockCls?: _classNameString,
  slideContentBlockTitleCls?: _classNameString,
  // @TODO minHeight ...
  carouselFallbackMinHeight?: string, // @TODO type
  paginationItemCls?: _classNameString,
  paginationGroupCls?: _classNameString,
  badge: Pick<FeTamaBlocksSliderPaginationItemProps, 'textProps'|'textCls'|'viewCls'|'viewProps'>,  // @TODO add isActive subset
  slideMeCta?: {
    color?: string, // css color prop
    rawSvg?: string, // like lucide-static/icons/pointer
  }
}

export type FeTamaBlocksSliderProps < // @TODO WIP!!!
  Collection extends SlidesEntriesCollection<C,K>,
  C extends SlideContentBlock = SlideContentBlock,  // value comes first, key type is optional
  K extends SlidesEntryHead = string
> = {
  contentEntriesCollection: Collection,
  options?: {
    styling?: FeTamaBlocksSliderStyling,
    debounceDelay?: FeSetupRectResizeObserverwithCbOptions['debounceDelay'],
    paginationCtrlVariant?: 'circles'|'badges'|'custom',  // @TODO
    paginationItem?: FeTamaBlocksSliderPaginationItem,
    paginationGroupProps?: React.ComponentProps<typeof XGroup>
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
  const componentId = useId()
  const activeEyIdx = useSignal(0)  // @TODO start from index

  const {
    contentEntriesCollection,
    options: _options = {}
  } = props
  const {
    debounceDelay = 0,
    paginationCtrlVariant = 'circles',
    paginationItem: _paginationItem,
    paginationGroupProps = {} as Exclude<Exclude<(typeof props)['options'], undefined>['paginationGroupProps'], undefined>,
    styling: _styling = {} as FeTamaBlocksSliderStyling,
  } = _options
  const {
    slideMeCta: _slideMeCta = {} as Exclude<FeTamaBlocksSliderStyling['slideMeCta'], undefined>,
  } = _styling
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
  const [neverPaginated, setNeverPaginated] = useState<boolean>(true)
  const paginationItem = _paginationItem ||( paginationCtrlVariant === 'badges'
    ? _PaginationItem_Badge
    : _PaginationItem_Circle
  )

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

  // const [[pageIdx, going], goSetPage] = useState([0, 0])
  // const activeIdxTransition = useRef({ pageIdx: 0, step: 0 })

  const _wrapinRange = useCallback((
    targetIdxwOverflow: number
  ) => wrapinRange(0, contentEntriesN, targetIdxwOverflow), [contentEntriesN])

  // type Lock = null | 'shouldAnimate' | 'animate' | 'scroll' // From tamagui.dev theme scroller

  const updateActiveIdx = useCallback((
    newIdxwOverflow: SetStateAction<number>,
    passive: boolean = false,
    // lock: Lock = 'shouldAnimate'
  ) => {
    setNeverPaginated(false)
    // * from tamagui.dev theme scroller, makes no sense here, yet
    const targetActiveIdx = _wrapinRange(
      _feIsFunction(newIdxwOverflow) ? newIdxwOverflow(activeEyIdx.value) : newIdxwOverflow
      // non-sense eq newIdxwOverflow
    )
    // setActiveIdx(newActiveIdx)
    // activeIdxTransition.current.step = targetActiveIdx - activeEyIdx.value
    // activeIdxTransition.current.pageIdx += activeIdxTransition.current.step /* aka newActiveIdx */
    // scrollViewRef.current?.goToSlide?.(newActiveIdx)
    if (!passive) scrollerApi?.scrollTo(targetActiveIdx)
    activeEyIdx.value = targetActiveIdx  // sideeffects trigger
  }, [activeEyIdx, _wrapinRange, scrollerApi, setNeverPaginated])

  const paginate = useCallback((step: number) => {
    updateActiveIdx(
      activeEyIdx.value + step
    )
  }, [updateActiveIdx, activeEyIdx])

  const followupScrollerStepped = useCallback(() => {
    const _slidesInView = scrollerApi?.slidesInView()
    const assumedActiveIdx = _slidesInView?.length? (_slidesInView[0] || _slidesInView[1]) - 1 : 0
    if (assumedActiveIdx !== activeEyIdx.value)
      updateActiveIdx(assumedActiveIdx, true)
  }, [scrollerApi, updateActiveIdx, activeEyIdx])

  useEffect(() => {
    if (scrollerApi) scrollerApi.on('settle', followupScrollerStepped)
  }, [scrollerApi, followupScrollerStepped])

  const selfRef = useRef<HTMLDivElement|null>(null)
  const [selfWidth,] = useWidthAndHeightofRef(selfRef, {debounceDelay}) // tracks the wrappers's width
  const {usePeakHeight, setupResizeObserverforEl} = usePeakHeightObserverOutlet({debounceDelay}) // Actually works w/o it if used like usememo below
  const peakContentHeight = usePeakHeight()

  // const rollingPeakContentHeigh = useRef<number>(0)
  // const [_peakContentHeight, _setPeakHeight] = useState<number>(carouselHeightFALLBACK)

  // The core thing:
  // const CarouselFallback = <div style={{height: carouselHeightFALLBACK}} />

  // const slidesRefs = useRef<(HTMLDivElement | typeof View | null)[]>([])
  // const {rollingPeakHeight: peakContentHeight, setContentElEy: pushSlidesRef} = useMeasuredPeakHeight({

  // const stripRef = useRef<HTMLDivElement|null>(null)

  const _PaginationItem: FeTamaBlocksSliderPaginationItem = (props) => (
    <span
      onClick={() => updateActiveIdx(props.idx)}
      style={{cursor: 'pointer'}}
    >
      {paginationItem({...props})}
    </span>
  )

  _slideMeCta.rawSvg ??= defaultSlideMeCtaSvg__()
  _slideMeCta.rawSvg = _slideMeCta.rawSvg.replaceAll('\n', ' ').replaceAll('\"', '\'')
    .replace('currentColor', _slideMeCta.color ?? defaultSlideMeCtaColor__)

  const paginationVariantsConfig = {
    base: {
      cursor: 'default',
    },
    circles: {
      disablePassBorderRadius: true,
      p: '$2',
      br: '$10',
      als: 'center'
    },
    badges: {
      // disablePassBorderRadius: false,
      // unstyled: true,
      jc: 'center',
      style: {
        // backgroundColor: 'yellow',
        flexFlow: 'row wrap',
        // width: '200px',
        width: '100%'
      }
    },
    custom: {}
  }

  const PaginationGroup = styled(XGroup, {
    ...paginationVariantsConfig.base, // @TODO
    ...paginationVariantsConfig[paginationCtrlVariant],
    ...paginationGroupProps
    // unstyled
    // style={{width: '75px', height: 'auto', flexFlow: 'row wrap', justifyContent: 'center'}}
  })

  type CommonRerenderingProps = {
    peakContentHeight: typeof peakContentHeight,
    selfWidth: typeof selfWidth,
    _styling: typeof _styling,
  }

  const Slides = memo((props: CommonRerenderingProps & {
    contentEntriesArray: typeof contentEntriesArray, isChBlocksCase: typeof isChBlocksCase,
    setupResizeObserverforEl: typeof setupResizeObserverforEl
  }) => {
    return contentEntriesArray?.map(([head, slideContentBlock], idx) => {
      return (
        <div
          // 'slideNode'
          // @ts-ignore @TODO review typing an the essential problem
          ref={(el: FeTrackedRectEl) =>
            setupResizeObserverforEl?.(el, idx)?.trackedEl
          }
          key={`slide-${String('label')}-${idx}`}
          style={{
            flex: '0 0 100%',
          }}>
          {isChBlocksCase
            ? slideContentBlock
            :
            <>
              {
                // @ts-ignore @TODO review typing
                !!head?.title &&
                <h3
                  className={_styling.slideContentBlockTitleCls}
                >
                  {
                    // @ts-ignore @TODO review typing
                    head.title
                  }
                </h3>
              }
              <p className={_styling.slideContentBlockCls}>
                {slideContentBlock}<br />
              </p>
            </>
          }
          {/* </WithMeasuredPeakHeight> */}
        </div>
      )
    })
  },
    (used, candidate) =>  // it's only a demo of a concept how to protect components from frequent input refreshes, WIP
      !Object.keys(candidate).find((key) => candidate[key as keyof typeof candidate] !== used[key as keyof typeof candidate])
      && JSON.stringify(candidate.contentEntriesArray) === JSON.stringify(used.contentEntriesArray)
  //   contentEntriesArray, peakContentHeight, selfWidth, setupResizeObserverforEl, isChBlocksCase
  // [ contentEntriesArray, peakContentHeight, selfWidth, _styling, isChBlocksCase, setupResizeObserverforEl
  // ]
  )

  const Carousel = useMemo(() => {
    return (false // !isClient || !_selfWidth
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
            height: peakContentHeight || carouselFallbackHeight__,
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
            <div />
              {/* {Slides} */}
              <Slides {...{
                contentEntriesArray, peakContentHeight, selfWidth, _styling, isChBlocksCase, setupResizeObserverforEl
              }} />
          </div>
        </div>
  )}, [
    Slides, paginate, scrollerRootRef,
    contentEntriesArray, peakContentHeight, selfWidth, _styling, isChBlocksCase, setupResizeObserverforEl
  ])

  if (!contentEntriesCollection || !contentEntriesN) return <div />

  return <div
    id={componentId}
    onSuspend={()=><div style={{minHeight: _styling.carouselFallbackMinHeight /* @TODO */}} />} // @TODO Check if it works at all
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

        @keyframes float {
          0% {
            filter: drop-shadow(0px 0.4rem 0.4rem rgb(0, 0, 0));
            transform: translatey(0px);
          }
          50% {
            filter: drop-shadow(0px 1.5rem 0.4rem rgb(0, 0, 0));
            transform: translatey(-20px);
          }
          100% {
            filter: drop-shadow(0px 0.4rem 0.4rem rgb(0, 0, 0));
            transform: translatey(0px);
          }
        }

        ${'#' + (typeof CSS !== 'undefined'? CSS.escape(componentId) : '') + '_CarouselWrapper'}.never-paginated:after {
          content: '';
          position: absolute;
          right: 10%;
          transform: translatey(0px);
          animation: float 6s ease-in-out infinite;
          display: inline-block;
          opacity: 80%;
          width: 1.5rem;
          height: 1.5rem;
          background-image: url("data:image/svg+xml;utf8,${_slideMeCta.rawSvg}");
        }

        #hellxox:before {
          content: 'blahblah'; /* here's the magic */
          position:absolute;

          /* vertically center */
          top:50%;
          transform:translateY(-50%);

          /* move to right */
          left:100%;
          margin-left:15px; /* and add a small left margin */

          /* basic styles */
          width:200px;
          padding:10px;
          border-radius:10px;
          background:#000;
          color: #fff;
          text-align:center;

          display:block; /* hide by default */
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
      }}
    >

      <XStack
        id={componentId + '_CarouselWrapper'}
        overflow="hidden"
        // backgroundColor="#000"
        position="relative"
        // height={_peakContentHeight}
        width='100%'
        alignItems="center"
        cursor='pointer'
        className={neverPaginated? 'never-paginated' : ''}
      >
        {/* {memo(Carousel, [* _peakContentHeight,  setPeakHeight, * _selfWidth]) */}
        {Carousel}

      </XStack>

      <XStack className="scroll-horizontal no-scrollbar">
        <XStack
          px="$0" // @TODO
          space="$2"
          width='100%'
          ai='left'
          style={{}}
        >
          <PaginationGroup className={_styling.paginationGroupCls}>
            {contentEntriesArray?.map(([head,], idx) => {
              const _head = _feIsObject(head) // @TODO duplicated code
                ? (head as SlidesEntryHeadwPyl) || {}
                : {label: head}
              return (
                <XGroup.Item key={`handle-${String(_head.label)}${idx}`}>
                  <_PaginationItem idx={idx} activeIdx={activeEyIdx} {...{
                    ..._styling.badge,
                    ..._head
                  }} />
                </XGroup.Item>
              )
            })}
          </PaginationGroup>
        </XStack>
      </XStack>
    </YStack>
  </div>
}

// https://codepen.io/MarioDesigns/pen/woJgeo

import type { CircleProps } from 'tamagui'
import { Circle, Text, /* YStack */ Button } from 'tamagui'

function _PaginationItem_Badge (props: FeTamaBlocksSliderPaginationItemProps) {
  const {
    idx, activeIdx, label, color, textCls, textProps, icon, viewCls, viewProps,
    ...rest } = props
  const [isActive, setIsActive] = useState(false)
  useSignalEffect(() => setIsActive(idx === activeIdx.value))

  const _IconFn = icon // _feIsFunction(props.icon) ? props.icon : undefined

  return (
    // <View
    //   className={viewCls}
    //   style={{
    //     display: 'flex',
    //     flexFlow: 'row nowrap',
    //     backgroundColor: isActive? 'black' : color,
    //   }}
    //   px='0.5rem' py='0.25rem'  // @TODO overrides any classname
    //   mx='0.25rem' mb='0.5rem'
    //   ai='center' jc='center'
    //   borderRadius='$1'
    //   hoverStyle={{
    //     backgroundColor: 'red'  // @TODO into a prop
    //   }}
    //   {...viewProps}
    // >
      <Button
        className={viewCls}
        icon={_IconFn}
        size='$2'
        // scaleIcon={0.9}
        borderWidth='0'
        borderRadius='$1'
        backgroundColor={isActive? 'black' : color}
        // px='0.5rem' py='0'  // @TODO overrides any classname
        mx='0.25rem' mb='0.5rem'
        // ai='center' jc='center'
        hoverStyle={{
          backgroundColor: 'red'  // @TODO into a prop
        }}
        {...viewProps}
      >
        <Text
          className={textCls}
          {...textProps}
          // color={textColor || 'white'}  // @TODO change if Active
        >
          {label}
        </Text>
      </Button>
      /* {_IconFn && <_IconFn
        className={textCls}
        size={'$1'} mt='0.1rem' mr='0.25rem' scaleX={0.75} scaleY={0.75}
        display='inline'
        {...textProps}
        // color={textColor || 'white'}
      />}
      <Text
        className={textCls}
        fontSize={'$1'}
        ai='center'
        display='inline'
        {...textProps}
        // color={textColor || 'white'}  // @TODO change if Active
      >
        {label}
      </Text> */
    // </View>
  )
}


// tamagui.dev/components/ActiveCircle

function _PaginationItem_Circle (props: CircleProps & FeTamaBlocksSliderPaginationItemProps) {
  const {
    idx, activeIdx, color, opacity,
    ...rest } = props
  const [isActive, setIsActive] = useState(false)
  useSignalEffect(() => setIsActive(idx === activeIdx.value))

  return (
    <YStack
      ai="center"
      jc="center"
      br="$10"
      borderColor="transparent"
      borderWidth={0}
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
        <Circle size={16} opacity={opacity} backgroundColor={isActive? 'black' : color} />
      </YStack>
    </YStack>
  )
}

function defaultSlideMeCtaSvg__ () {
  return `
    <svg
      class="lucide lucide-pointer"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M22 14a8 8 0 0 1-8 8" />
      <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
      <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
      <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  `
}
