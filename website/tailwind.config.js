const defaultTheme = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")
const {default: flattenColorPalette} = require("tailwindcss/lib/util/flattenColorPalette")
const {toRgba} = require("tailwindcss/lib/util/withAlphaVariable")

module.exports = {
  mode: "jit",
  purge: {
    content: ["{app,pages,remark}/**/*.{js,jsx,ts,tsx}"],
    options: {
      safelist: ["bg-code-block"],
    },
  },
  darkMode: "class",
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",

      black: "#000",
      "off-black": "#191919",
      "off-white": "#EEF2F7",
      white: "#FCFCFD",
      "dark-mode-text": "#c9d1d9",

      amber: colors.amber,
      blue: {
        ...colors.blue,
        light: "#D5DEE9",
        mid: "#BCC9DC",
        primary: "#A7B6CE",
        dark: "#7B96BC",
        gradient: {
          white: "#FEFDFF",
          "light-blue": "#CDABF8",
        },
      },
      cyan: colors.cyan,
      emerald: colors.emerald,
      fuchsia: colors.fuchsia,
      gray: colors.coolGray,
      green: colors.green,
      indigo: colors.indigo,
      "light-blue": colors.sky,
      lime: colors.lime,
      orange: {
        ...colors.orange,
        1000: "#4a2008",
      },
      pink: {
        ...colors.pink,
        1000: "#460d25",
      },
      purple: {
        ...colors.purple,
        extralight: "#ae53ff",
        light: "#6700EB",
        mid: "#5600C2",
        primary: "#45009D",
        dark: "#34017B",
        middark: "#27005d",
        extradark: "#10002f",
        "off-black": "#1F084E",
        "dark-code": "#150635",
        deep: "#0E001D",
      },
      red: colors.red,
      rose: colors.rose,
      teal: colors.teal,
      violet: colors.violet,
      yellow: colors.yellow,

      code: {
        block: "#F9F5FE",
        punctuation: "#A1E8FF",
        tag: "#D58FFF",
        "attr-name": "#4BD0FB",
        "attr-value": "#A2F679",
        string: "#A2F679",
        highlight: "rgba(134, 239, 172, 0.25)",
      },
    },
    fontSize: {
      xxs: "0.75rem", // 12px
      xs: ["0.8125rem", "1.1375rem"], // 13px
      sm: ["0.9rem"], // 14px
      base: ["0.9375rem"], //"1.375rem"], // 15px
      lg: ["1.0625rem", "1.5625rem"], // 17px
      xl: ["1.25rem", "2rem"], // 20px
      "2xl": ["1.5rem", "1.875rem"], // 24px
      "3xl": ["2rem", "2.4375rem"], // 32px
      "4xl": "2.375rem", // 38px
      "5xl": ["2.8125rem", "4.025rem"], // 45px
      "5xl-squashed": ["2.8125rem", "3.0938rem"],
      "6xl": ["3.875rem", "4.84375rem"], // 62px
      "7xl": ["6rem", "7rem"], // 62px
      "8xl": ["8.5em", "1.1"], // 62px
      h2: ["2.6rem"],
      h3: ["1.8rem"],
      h4: ["1.5rem"],
    },
    borderColor: (theme) => ({
      ...theme("colors"),
      primary: "#bcc9dc",
    }),
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black"),
            fontSize: theme("fontSize.sm")[0],
            maxWidth: "none",
            "> :first-child": {marginTop: "-"},
            "> :last-child": {marginBottom: "-"},
            "&:first-child > :first-child": {
              marginTop: "0",
            },
            "&:last-child > :last-child": {
              marginBottom: "0",
            },
            h2: {
              fontSize: theme("fontSize.2xl")[0],
              fontWeight: theme("fontWeight.medium"),
              marginTop: theme("spacing.8"),
              marginBottom: theme("spacing.6"),
            },
            h3: {
              fontSize: theme("fontSize.xl")[0],
              fontWeight: theme("fontWeight.medium"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.4"),
            },
            h4: {
              fontSize: theme("fontSize.lg")[0],
              fontWeight: theme("fontWeight.semibold"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.4"),
            },
            h5: {
              fontSize: theme("fontSize.base")[0],
              fontWeight: theme("fontWeight.bold"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.4"),
            },
            "h1, h2": {
              letterSpacing: "-0.025em",
            },
            "h2, h3": {
              "scroll-margin-block": `${(70 + 40) / 16}rem`,
            },
            "ul > li": {
              paddingLeft: "1.5em",
            },
            "ul > li::before": {
              width: "0.75em",
              height: "0.13rem",
              top: "calc(0.875em - 0.0625em)",
              left: 0,
              borderRadius: 0,
              backgroundColor: theme("colors.purple.light"),
            },
            a: {
              color: theme("colors.purple.light"),
              fontWeight: theme("fontWeight.medium"),
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            "a code": {
              color: "inherit",
              fontWeight: "inherit",
            },
            strong: {
              fontWeight: theme("fontWeight.bold"),
            },
            "a strong": {
              color: "inherit",
              fontWeight: "inherit",
            },
            code: {
              fontWeight: "400",
              color: "#280088",
              backgroundColor: "#f2f0fd",
              borderRadius: 3,
              overflowWrap: "break-word",
            },
            "pre code": {
              color: theme("colors.black"),
              fontWeight: "400",
              fontSize: theme("fontSize.xs")[0],
              lineHeight: 1.4,
            },
            pre: {
              lineHeight: 1.4,
              backgroundColor: "-",
              color: theme("colors.white"),
              borderRadius: 0,
              marginTop: 0,
              marginBottom: 0,
            },
            table: {
              fontSize: theme("fontSize.sm")[0],
              // lineHeight: theme("fontSize.sm")[1].lineHeight,
            },
            thead: {
              color: theme("colors.gray.600"),
              borderBottomColor: theme("colors.gray.200"),
            },
            "thead th": {
              paddingTop: 0,
              fontWeight: theme("fontWeight.semibold"),
            },
            "tbody tr": {
              borderBottomColor: theme("colors.gray.200"),
            },
            "tbody tr:last-child": {
              borderBottomWidth: "1px",
            },
            "tbody code": {
              fontSize: theme("fontSize.xs")[0],
            },
          },
        },
        xl: {
          css: {
            fontSize: theme("fontSize.base")[0],
            h2: {
              fontSize: theme("fontSize.3xl")[0],
              fontWeight: theme("fontWeight.medium"),
              marginTop: theme("spacing.12"),
              marginBottom: theme("spacing.6"),
            },
            h3: {
              fontSize: theme("fontSize.2xl")[0],
              fontWeight: theme("fontWeight.medium"),
              marginTop: theme("spacing.10"),
              marginBottom: theme("spacing.4"),
            },
            h4: {
              fontSize: theme("fontSize.xl")[0],
              fontWeight: theme("fontWeight.semibold"),
              marginTop: theme("spacing.8"),
              marginBottom: theme("spacing.4"),
            },
            h5: {
              fontSize: theme("fontSize.lg")[0],
              fontWeight: theme("fontWeight.bold"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.4"),
            },
            "pre code": {
              fontSize: theme("fontSize.sm")[0],
              lineHeight: 1.4,
            },
            pre: {
              lineHeight: 1.4,
              marginTop: 0,
              marginBottom: 0,
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            },
            "ul > li": {
              paddingLeft: "1.5em",
            },
            "ul > li::before": {
              width: "0.75em",
              height: "0.13rem",
              top: "calc(0.875em - 0.0625em)",
              left: 0,
              borderRadius: 0,
              backgroundColor: theme("colors.purple.light"),
            },
            table: {
              fontSize: theme("fontSize.sm")[0],
              // lineHeight: theme("fontSize.sm")[1].lineHeight,
            },
            thead: {
              borderBottomColor: theme("colors.gray.200"),
            },
            "thead th": {
              paddingTop: 0,
              fontWeight: theme("fontWeight.semibold"),
            },
            "tbody tr": {
              borderBottomColor: theme("colors.gray.200"),
            },
            "tbody tr:last-child": {
              borderBottomWidth: "1px",
            },
            "tbody code": {
              fontSize: theme("fontSize.xs")[0],
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.dark-mode-text"),
            "h1, h2, h3, h4, h5, h6, a, strong, code, pre code, blockquote": {
              color: theme("colors.dark-mode-text"),
            },
            th: {
              color: theme("colors.gray.400"),
            },
            strong: {
              fontWeight: theme("fontWeight.bold"),
            },
            a: {
              fontWeight: theme("fontWeight.bold"),
              textDecoration: "underline",
              "&:hover": {
                color: theme("colors.purple.extralight"),
                textDecoration: "underline",
              },
            },
            code: {
              backgroundColor: theme("colors.purple.middark"),
            },
            "pre code": {
              backgroundColor: "transparent",
            },
          },
        },
      }),
      fontFamily: {
        secondary: ["Roboto", ...defaultTheme.fontFamily.sans],
        primary: ["Libre Franklin", defaultTheme.fontFamily.sans],
        mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
        system: defaultTheme.fontFamily.sans,
      },
      spacing: {
        18: "4.5rem",
        "15px": "0.9375rem",
        "23px": "1.4375rem",
        sandbox: "28rem",
        "xl-sandbox": "32rem",
        full: "100%",
      },
      width: {
        xl: "36rem",
        "7xl": "80rem",
      },
      minHeight: {
        10: "10rem",
      },
      maxWidth: {
        "4.5xl": "60rem",
        "8xl": "90rem",
      },
      maxHeight: (theme) => ({
        sm: "30rem",
        "(screen-18)": `calc(100vh - ${theme("spacing.18")})`,
      }),
      height: {
        codesandbox: "calc(100% - 20rem)",
      },
      boxShadow: {
        px: "0 0 0 1px rgba(0, 0, 0, 0.5)",
        link: "inset 0 -0.125em 0 0 #fff, inset 0 -0.375em 0 0 rgba(165, 243, 252, 0.4)",
      },
      keyframes: {
        "flash-code": {
          "0%": {backgroundColor: "rgba(134, 239, 172, 0.25)"},
          "100%": {backgroundColor: "transparent"},
        },
        "slide-in": {
          "0%": {
            transform: "translateY(-20%)",
            display: "flex",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        "slide-out": {
          "0%": {
            transform: "translateY(0%)",
          },
          "100%": {
            transform: "translateY(-20%)",
            display: "none",
          },
        },
      },
      animation: {
        "flash-code": "flash-code 1s forwards",
        "flash-code-slow": "flash-code 2s forwards",
        "slide-in": "slide-in 0.5s 1",
        "slide-out": "slide-out 0.5s 1",
      },
      cursor: {
        grab: "grab",
        grabbing: "grabbing",
      },
      transitionDuration: {
        1500: "1.5s",
      },
      backgroundImage: {
        squiggle: `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%206%203'%20enable-background%3D'new%200%200%206%203'%20height%3D'3'%20width%3D'6'%3E%3Cg%20fill%3D'%23fbbf24'%3E%3Cpolygon%20points%3D'5.5%2C0%202.5%2C3%201.1%2C3%204.1%2C0'%2F%3E%3Cpolygon%20points%3D'4%2C0%206%2C2%206%2C0.6%205.4%2C0'%2F%3E%3Cpolygon%20points%3D'0%2C2%201%2C3%202.4%2C3%200%2C0.6'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
      },
      scale: {
        80: "0.8",
      },
      skew: {
        "-20": "-20deg",
      },
      zIndex: {
        "-10": "-10",
        "-20": "-20",
      },
      borderRadius: {
        "2xl": "1.56rem",
        "3xl": "3rem",
        "4xl": "6.75rem",
      },
      gridRowStart: {
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
      },
      gridRowEnd: {
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
        13: "13",
        14: "14",
        15: "15",
        16: "16",
        17: "17",
        18: "18",
        19: "19",
        20: "20",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["odd", "even", "active"],
      borderWidth: ["first", "last", "hover", "focus"],
      cursor: ["active"],
      textColor: ["group-focus"],
      ringWidth: ["focus-visible"],
      ringOffsetWidth: ["focus-visible"],
      ringOffsetColor: ["focus-visible"],
      ringColor: ["focus-visible"],
      ringOpacity: ["focus-visible"],
      rotate: ["first", "last", "odd", "even"],
      display: ["dark"],
      typography: ["dark", "responsive"],
      backgroundImage: ["hover", "focus"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({addUtilities, theme}) {
      const shadows = theme("boxShadow")
      addUtilities(
        Object.keys(shadows).reduce(
          (utils, key) => ({
            ...utils,
            [`.text-shadow${key === "DEFAULT" ? "," : `-${key}`}`]: {
              textShadow: shadows[key].replace(
                /([0-9]+(px)? [0-9]+(px)? [0-9]+(px)?) [0-9]+(px)?/g,
                "$1",
              ),
            },
          }),
          {},
        ),
      )
    },
    function ({addUtilities, theme}) {
      const utilities = {
        ".bg-stripes": {
          backgroundImage:
            "linear-gradient(45deg, var(--stripes-color) 12.50%, transparent 12.50%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 62.50%, transparent 62.50%, transparent 100%)",
          backgroundSize: "5.66px 5.66px",
        },
      }

      const addColor = (name, color) =>
        (utilities[`.bg-stripes-${name}`] = {"--stripes-color": color})

      const colors = flattenColorPalette(theme("backgroundColor"))
      for (let name in colors) {
        try {
          const [r, g, b, a] = toRgba(colors[name])
          if (a !== undefined) {
            addColor(name, colors[name])
          } else {
            addColor(name, `rgba(${r}, ${g}, ${b}, 0.4)`)
          }
        } catch (_) {
          addColor(name, colors[name])
        }
      }

      addUtilities(utilities)
    },
  ],
}
