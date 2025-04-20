/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Extend the blue color palette to ensure consistency
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Extend amber for the banners
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Add indigo for gradients
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      // Add custom box shadows if needed
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Add custom gradient if needed
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Add slide-in animations
      keyframes: {
        'slide-in-right': {
          '0%': { 
            transform: 'translate(-50%, -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '10%': {
            transform: 'translate(-50%, -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '30%': {
            transform: 'translate(-40%, -80%)',
            opacity: '0.5',
            visibility: 'visible'
          },
          '60%': {
            transform: 'translate(calc(-45% - var(--offset-x) * 0.7), -60%)',
            opacity: '0.8',
            visibility: 'visible'
          },
          '100%': { 
            transform: 'translate(calc(-50% - var(--offset-x)), -50%)',
            opacity: '1',
            visibility: 'visible'
          }
        },
        'slide-in-left': {
          '0%': { 
            transform: 'translate(-50%, -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '10%': {
            transform: 'translate(-50%, -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '30%': {
            transform: 'translate(-60%, -80%)',
            opacity: '0.5',
            visibility: 'visible'
          },
          '60%': {
            transform: 'translate(calc(-55% + var(--offset-x) * 0.7), -60%)',
            opacity: '0.8',
            visibility: 'visible'
          },
          '100%': { 
            transform: 'translate(calc(-50% + var(--offset-x)), -50%)',
            opacity: '1',
            visibility: 'visible'
          }
        },
        'slide-in-center': {
          '0%': { 
            transform: 'translate(calc(-50% + var(--center-offset-x, 0px)), -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '10%': {
            transform: 'translate(calc(-50% + var(--center-offset-x, 0px)), -120%)',
            opacity: '0',
            visibility: 'hidden'
          },
          '30%': {
            transform: 'translate(calc(-50% + var(--center-offset-x, 0px)), -85%)',
            opacity: '0.5',
            visibility: 'visible'
          },
          '60%': {
            transform: 'translate(calc(-50% + var(--center-offset-x, 0px)), -65%)',
            opacity: '0.8',
            visibility: 'visible'
          },
          '100%': { 
            transform: 'translate(calc(-50% + var(--center-offset-x, 0px)), -50%)',
            opacity: '1',
            visibility: 'visible'
          }
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 1s ease-out forwards',
        'slide-in-left': 'slide-in-left 1s ease-out forwards',
        'slide-in-center': 'slide-in-center 0.8s ease-out forwards'
      }
    },
  },
  plugins: [],
} 