import { 
  useState, useLayoutEffect, createContext, useRef
} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { _feIsFunction } from '@mflt/_fe'
import { 
  useWidthAndHeightofRef,  type FeTrackedRectDims, type FeTrackedRectEl, 
  type FeSetupRectResizeObserverwithCbOptions
} from '@mflt/f-react-e'

export interface IAgentViewportContext {
  _window: typeof window | null,
  layoutViewportWidth: typeof window['innerWidth'],
  layoutViewportHeight: typeof window['innerHeight'],
  documentWidth: FeTrackedRectDims['width'],
  documentHeight: FeTrackedRectDims['height'],
}

export const AgentViewportContext = createContext<IAgentViewportContext>({
  _window: null,
  layoutViewportWidth: 0,
  layoutViewportHeight: 0,
  documentWidth: 0,
  documentHeight: 0,
})

export type AgentViewportContextProviderProps = {
  skipSetup?: (() => boolean) | boolean,  // meaning the intitial values 
  debounceDelay?: FeSetupRectResizeObserverwithCbOptions['debounceDelay']
}

const getWindowInnerDims = (
  _window: typeof window | null
) => {
  return [
    _window?.innerWidth || 0,
    _window?.innerHeight || 0,
  ] satisfies [
    IAgentViewportContext['layoutViewportWidth'], 
    IAgentViewportContext['layoutViewportHeight']
  ]
}

// let windowResizeTicking_ = false

export function AgentViewportContextProvider (props: 
  & React.PropsWithChildren 
  & AgentViewportContextProviderProps
): React.ReactElement {
  const {
    children: slot,
    skipSetup: skipSetup_ = false,
    debounceDelay = 0,
  } = props

  const [_window, setWindow] = useState<IAgentViewportContext['_window']>(
    typeof window !== 'undefined'? window : null
  )
  const [[layoutViewportWidth, layoutViewportHeight], setLayoutViewportDims] = useState(
    getWindowInnerDims(_window)
  )
  const documentRef = useRef<HTMLElement>(
    typeof window !== 'undefined'? document.body : null
  )
  const [documentWidth, documentHeight] = useWidthAndHeightofRef(documentRef, {debounceDelay})

  // const [
  //   animationFrameRequestId,
  //   setAnimationFrameRequestId
  // ] = useState<ReturnType<typeof window.requestAnimationFrame>|undefined>(undefined)

  const handleWindowResize = useDebouncedCallback(() => {
    // if (!windowResizeTicking_) {
      // const _animationFrameRequestId = window.requestAnimationFrame(() => {
    setLayoutViewportDims(getWindowInnerDims(_window))
      // windowResizeTicking_ = false
      // })
      // window.cancelAnimationFrame(animationFrameRequestId!)
      // setAnimationFrameRequestId(_animationFrameRequestId)
      // windowResizeTicking_ = true
    // }
  }, debounceDelay)

  useLayoutEffect(() => { // @TODO defend why LayoutEffect
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
      // window.cancelAnimationFrame(animationFrameRequestId!)
    }
  }, [_window])

  useLayoutEffect(() => {
    if (!(_feIsFunction(skipSetup_)? skipSetup_() : skipSetup_)) {
      // setWindow(window)
      setLayoutViewportDims(getWindowInnerDims(_window))
    }
  }, [_window, skipSetup_]) // @TODO isWeb

  return <AgentViewportContext.Provider value={{
    _window,
    layoutViewportWidth, layoutViewportHeight,
    documentWidth, documentHeight,
  }}>
    {slot}
  </AgentViewportContext.Provider>
}

// https://stackoverflow.com/a/73366256
// https://developer.mozilla.org/en-US/docs/Web/CSS/CSSOM_view/Viewport_concepts
