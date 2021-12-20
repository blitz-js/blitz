import {red} from "@mui/material/colors"
import {createTheme} from "@mui/material/styles"

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#6700EB",
    },
    secondary: {
      main: "#FFFFFF",
    },
    error: {
      main: red.A400,
    },
  },
})

export default theme
