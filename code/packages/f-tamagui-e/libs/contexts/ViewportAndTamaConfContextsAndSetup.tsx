import React, { useEffect } from 'react'
import { createTamagui, isWeb } from 'tamagui'
// import tamaConf from '../config/tamagui.config'
// import { usePathname } from 'one'
// import type { TamaConf } from '~/config/tamagui.config'
import { 
  AgentViewportContextProvider, type AgentViewportContextProviderProps
} from '@mflt/f-react-e'
import { TamaConfContext } from '@mflt/f-tamagui-e'

let setupFnDone_ = false

export const ViewportAndTamaConfContextsAndSetup = (props: // aka Provider
  & React.PropsWithChildren 
  & {
    tamaConf: ReturnType<typeof createTamagui>
    setupFn?: () => Promise<unknown>
    fAwaitSetupFn?: boolean,
    debounceDelay: AgentViewportContextProviderProps['debounceDelay']
    // onError
}) => {
  const {
    children: slot,
    debounceDelay,
    tamaConf,
    setupFn,
    fAwaitSetupFn
  } = props

  useEffect(()=> {  // @TODO Layout?
    if (!setupFnDone_) {
      (async () => {
        try {
          if (!fAwaitSetupFn) {
            setupFn?.()
          } else {
            await setupFn?.()
          }
          // if (globalThis.mfe_site === 'itz') {
          //   // import('~/[prepared]/styles/itz.tama.css')  // @TODO React.lazy, loadmodule
          // } else {
          //   import('~/[prepared]/styles/scm.tama.css')
          // }
          // import('~/helpers/bootstrapping/client')
        } catch (err) {
          // console.log(pathname,globalThis.mfe_site)
        } finally {
          setupFnDone_ = true
        }
      })()
    }
  },[])

  return (
    <AgentViewportContextProvider skipSetup={!isWeb} debounceDelay={debounceDelay} >
      <TamaConfContext.Provider value={tamaConf}>
        {slot}
      </TamaConfContext.Provider>
    </AgentViewportContextProvider>
  )
}
