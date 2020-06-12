const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  // ideally we should use this since the tailwind bundle is quite big,
  // but it isn’t working with certain dynamic styles right now.
  // purge: ['./**/{pages,components}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderWidth: {
        3: '3px',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/ui')],
}
