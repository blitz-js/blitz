// stitches.config.ts
import {createStitches} from "@stitches/react"

export const {styled, css, globalCss, keyframes, getCssText, theme, createTheme, config} =
  createStitches({
    theme: {
      colors: {
        gray400: "gainsboro",
        gray500: "lightgray",
      },
    },
    media: {
      bp1: "(min-width: 480px)",
    },
    utils: {
      marginX: (value: String | Number) => ({marginLeft: value, marginRight: value}),
    },
  })
