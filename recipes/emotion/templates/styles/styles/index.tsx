import {css, Global} from "@emotion/react"

export const globalStyles = (
  <Global
    styles={css`
      html,
      body {
        background-color: papayawhip;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 24px;
        margin: 0;
        min-height: 100vh;
      }
    `}
  />
)
