import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#2a3441',
        boreal: { dark: '#2a3441', light: '#e8eff5' }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        manrope: ['Manrope', 'sans-serif'],
      },
    }
  },
  plugins: [],
};

export default config;
