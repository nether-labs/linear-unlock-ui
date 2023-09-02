import { createTheme, experimental_extendTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    purple: Palette["primary"];
    darkPurple: Palette["primary"];
    lightPurple: Palette["primary"];
  }
  interface PaletteOptions {
    purple: PaletteOptions["primary"];
    darkPurple: PaletteOptions["primary"];
    lightPurple: PaletteOptions["primary"];
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsColorOverrides {
    purple: true;
    darkPurple: true;
    lightPurple: true;
  }
}

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor: any) =>
  augmentColor({ color: { main: mainColor } });

export const customTheme = experimental_extendTheme({
  typography: {
    fontSize: 13,
    fontFamily: [
      "IBM Plex Sans",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            background: "rgb(66 65 65 / 40%)",
            color: "#dadada",
          },
        },
      },
    },
  },

  colorSchemes: {
    light: {
      palette: {
        purple: createColor("#730DE7"),
        darkPurple: createColor("#2f0048"),
        lightPurple: createColor("#2e1d4b"),
        primary: createColor("#730de7"),
        secondary: {
          ...createColor("#19132b"),
          light: "rgb(255 203 229)",
        },
        error: {
          main: "#f44336",
          light: "#e57373",
          dark: "#d32f2f",
          contrastText: "#ffffff",
        },
        warning: {
          main: "#ff9800",
          light: "#ffb74d",
          dark: "#f57c00",
          contrastText: "rgba(0, 0, 0, 0.87)",
        },
        info: createColor("#DCD6FF"),
        success: {
          main: "#4CAF50",
          light: "#81C784",
          dark: "#388E3C",
          contrastText: "#ffffff",
        },
        background: {
          default: "#110C1E",
          paper: "#110C1E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.7)",
          disabled: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
    dark: {
      palette: {
        purple: createColor("#8F3DEB"),
        darkPurple: createColor("#110c1e"),
        lightPurple: createColor("#2e1d4b"),
        primary: createColor("#730de7"),
        secondary: createColor("#19132b"),

        error: {
          main: "#f44336",
          light: "#e57373",
          dark: "#d32f2f",
          contrastText: "#ffffff",
        },
        warning: {
          main: "#ff9800",
          light: "#ffb74d",
          dark: "#f57c00",
          contrastText: "rgba(0, 0, 0, 0.87)",
        },
        info: createColor("#DCD6FF"),
        success: {
          main: "#4CAF50",
          light: "#81C784",
          dark: "#388E3C",
          contrastText: "#ffffff",
        },
        background: {
          default: "#110C1E",
          paper: "#110C1E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.7)",
          disabled: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  },
});
