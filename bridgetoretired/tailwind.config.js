/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        black:   '#0a0c0f',
        navy:    '#0d1420',
        ink:     '#141c28',
        slate:   '#1e2a3a',
        muted:   '#2d3d52',
        gold:    '#e8b84b',
        teal:    '#2dd4bf',
        sage:    '#4ade80',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        lora: ['var(--font-lora)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
