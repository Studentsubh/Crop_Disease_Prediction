/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lab-bg': '#0B0F0C',
        'lab-surface': '#141A15',
        'lab-gold': '#C9A227',
        'lab-sage': '#7C9A78',
        'lab-rust': '#B5533C',
        'lab-text-primary': '#EDEAE1',
        'lab-text-muted': '#9AA39A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'lab-glow': '0 0 15px rgba(201, 162, 39, 0.15)',
        'lab-glow-sage': '0 0 15px rgba(124, 154, 120, 0.15)',
        'lab-glow-rust': '0 0 15px rgba(181, 83, 60, 0.15)',
      }
    },
  },
  plugins: [],
}
