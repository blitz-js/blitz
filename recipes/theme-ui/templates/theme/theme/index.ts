import shadesOfPurple from "@theme-ui/prism/presets/shades-of-purple.json"

const theme = {
  initialColorModeName: "light",
  useColorSchemeMediaQuery: true,
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#07c",
    secondary: "#609",
    modes: {
      dark: {
        text: "#fff",
        background: "#222",
        primary: "#0cf",
        secondary: "#90c",
      },
    },
  },
  sizes: {
    container: 768,
  },
  fonts: {
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: "inherit",
  },
  styles: {
    root: {
      fontFamily: "body",
      color: "text",
      bg: "background",
    },
    h1: {
      fontSize: [4, 5, 6],
      color: "primary",
    },
    a: {
      color: "primary",
      textDecoration: "none",
      ":hover": {
        color: "secondary",
        textDecoration: "underline",
      },
    },
    pre: {
      borderRadius: "10px",
      ".highlight": {
        background: "hsla(0, 0%, 30%, .5)",
      },
    },
    code: {
      padding: "20px",
      ...shadesOfPurple,
    },
  },
}

export default theme
