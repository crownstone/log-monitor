import { createTheme } from '@mui/material/styles';
import {colors} from "./colors";


export const GuardianTheme = createTheme({
  palette: {
    primary: {
      main: colors.blue.hex,
    },
    secondary: {
      main: colors.green.hex,
    },
    success: {
      main: colors.green.hex,
    },
    error: {
      main: colors.red.hex,
    },
    background: {
      default: colors.white.hex,
    },
  },
});