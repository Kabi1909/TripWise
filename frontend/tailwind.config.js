/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0058bc",
        "primary-container": "#0070eb",
        "surface-bright": "#f9f9fe",
        "surface-container-low": "#f3f3f8",
        "surface-container-high": "#e8e8ed",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#e2e2e7",
        "on-surface": "#1a1c1f",
        "on-surface-variant": "#414755",
        "tertiary": "#006b27",
        "tertiary-container": "#008733",
        "secondary-container": "#fe9400",
        "error": "#ba1a1a",
        "error-container": "#ffdad6"
      }
    },
  },
  plugins: [],
} 
