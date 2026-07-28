/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unet: {
          blue: '#003366',
          lightBlue: '#0056b3',
          gold: '#FFD700',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          dark: '#1a1a2e'
        }
      }
    },
  },
  plugins: [],
}
