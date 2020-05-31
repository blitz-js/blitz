const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./**/{pages,components}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/ui')],
}
