// import type { ViewStyle } from 'tamagui'
import { View, styled, isWeb } from 'tamagui'
import { _feIsString } from '@mflt/_fe'

export const ViewwithDisplayContents = styled(View,
  isWeb
  ? {
      display: 'contents',
    }
  : {}  // @TODO is it the rite choice here?
)

export function getNamedCssGridAreaasView (
  areaName: string
) {
  if (!_feIsString(areaName) || !isWeb) {
    // @TODO error message
    return null
  }
  return styled(View, {
    // display: 'contents',
    '$platform-web': {gridArea: areaName} as any
  })
}
