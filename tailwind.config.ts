import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			body: [
  				'PT Sans',
  				'sans-serif'
  			],
  			headline: [
  				'Space Grotesk',
  				'sans-serif'
  			],
  			code: [
  				'monospace'
  			]
  		},
  		colors: {
  			background: '#ffffff',
  			foreground: '#000000',
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#000000'
  			},
  			popover: {
  				DEFAULT: '#ffffff',
  				foreground: '#000000'
  			},
  			primary: {
  				DEFAULT: 'var(--primary, #0056b3)',
  				foreground: 'var(--primary-foreground, #ffffff)'
  			},
  			secondary: {
  				DEFAULT: '#f0f0f0',
  				foreground: '#000000'
  			},
  			muted: {
  				DEFAULT: '#f0f0f0',
  				foreground: '#7f7f7f'
  			},
  			accent: {
  				DEFAULT: 'var(--accent, #0056b3)',
  				foreground: 'var(--accent-foreground, #ffffff)'
  			},
  			destructive: {
  				DEFAULT: '#ff0000',
  				foreground: '#ffffff'
  			},
  			border: '#e5e5e5',
  			input: '#e5e5e5',
  			ring: '#0056b3',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
