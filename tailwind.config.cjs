module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d5a27',
        secondary: '#7cb342',
        dark: '#1a1a1a',
        light: '#f5f5f5'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace']
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
