import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'oklch(11% 0.01 260)',
        card: 'oklch(16% 0.02 260)',
        'card-hover': 'oklch(19% 0.025 260)',
        border: 'oklch(25% 0.03 260)',
        muted: 'oklch(45% 0.02 260)',
        primary: 'oklch(62% 0.22 195)',
        'primary-dim': 'oklch(45% 0.15 195)',
        hr: 'oklch(65% 0.21 22)',
        hrv: 'oklch(70% 0.18 295)',
        recovery: 'oklch(65% 0.20 250)',
        strain: 'oklch(72% 0.21 60)',
        success: 'oklch(68% 0.19 150)',
        warning: 'oklch(72% 0.21 85)',
        danger: 'oklch(65% 0.25 25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
