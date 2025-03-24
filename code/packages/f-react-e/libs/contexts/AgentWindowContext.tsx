import { useState, useEffect, createContext, useCallback } from 'react'
import { _feIsFunction } from '@mflt/_fe'

export interface IAgentWindowContext {
  _window: typeof window | null
  innerWidth: typeof window['innerWidth']
  innerHeight: typeof window['innerHeight']
}

export const AgentWindowContext = createContext<IAgentWindowContext|null>(null)

const getWindowDims = (
  _window: typeof window | null
) => {
  return {
    innerWidth: _window?.innerWidth || 0,
    innerHeight: _window?.innerHeight || 0,
  } as Omit<IAgentWindowContext,'_window'>
}

export const InitAgentWindowContext = (props: React.PropsWithChildren & {
  skipSetup?: (() => boolean) | boolean
}) => {
  const {
    children,
    skipSetup = false
  } = props

  const [_window, setWindow] = useState<IAgentWindowContext['_window']>(null)
  const [dims, setDims] = useState(getWindowDims(_window))
  const [
    animationFrameRequestId,
    setAnimationFrameRequestId
  ] = useState<ReturnType<typeof window.requestAnimationFrame>|undefined>(undefined)

  useEffect(() => {
    if (_feIsFunction(skipSetup)? skipSetup() : skipSetup) {
      setWindow(window)
      setDims(getWindowDims(_window))
    }
  }, [_window]) // @TODO isWeb

  const handleResize = useCallback(() => {
    let ticking = false
    if (!ticking) {
      const _animationFrameRequestId = window.requestAnimationFrame(() => {
        setDims(getWindowDims(_window))
        ticking = false
      })
      // window.cancelAnimationFrame(animationFrameRequestId!)
      // setAnimationFrameRequestId(_animationFrameRequestId)
      ticking = true
    }
  }, [_window])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      // window.cancelAnimationFrame(animationFrameRequestId!)
    }
  }, [_window])

  return <AgentWindowContext value={{
    _window,
    ...dims
  }}>
    {children}
  </AgentWindowContext>
}

// https://stackoverflow.com/a/73366256
