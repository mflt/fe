import { createContext } from 'react'
import { type createTamagui } from 'tamagui'

export const TamaConfContext = createContext<ReturnType<typeof createTamagui>|undefined>(undefined)
