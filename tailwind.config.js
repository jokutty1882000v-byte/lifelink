/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  // Angular Material owns base element styling; Tailwind's preflight was
  // shrinking inputs and clipping icon suffixes. We add the few base rules we
  // actually need manually in styles.scss.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Medical palette — kept in sync with Material theme tokens
        blood: {
          50:  '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#e53935', // primary red
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#8e0000'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '1rem'
      }
    }
  },
  plugins: []
};
