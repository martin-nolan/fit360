import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/entities/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'electric-teal': '#1ABCFE',
        // A neutral greyscale for the dark-mode default theme
        gray: {
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#e5e5e5',
          '300': '#d4d4d4',
          '400': '#a3a3a3',
          '500': '#737373',
          '600': '#525252',
          '700': '#404040',
          '800': '#262626',
          '900': '#171717',
          '950': '#0a0a0a',
        },
      },
      spacing: {
        // 8-pt grid system
        '0': '0',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        // ... can be extended as needed
      },
      borderRadius: {
        'xl': '16px', // 2 * XL rounded corners as per spec (assuming XL is 8px)
        '2xl': '24px',
      },
      boxShadow: {
        // Elevation scale (0-8dp) - using standard shadow names as placeholders
        'dp-0': 'none',
        'dp-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dp-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'dp-3': '0 6px 10px 0 rgb(0 0 0 / 0.1), 0 1px 18px 0 rgb(0 0 0 / 0.1)',
        'dp-4': '0 8px 12px 0 rgb(0 0 0 / 0.1), 0 3px 12px 0 rgb(0 0 0 / 0.1)',
        // ... can be extended to 8dp
      },
    },
  },
  plugins: [],
}
export default config
