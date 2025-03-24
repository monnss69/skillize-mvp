import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				settings: {
					'bg': {
						'primary': '#0A0F14',
						'secondary': '#0D1419',
						'tertiary': '#1E2A36',
					},
					'border': {
						'primary': '#1E2A36',
						'secondary': '#2A3A4A',
						'accent': '#B8A47C',
						'accent-hover': '#B8A47C30',
					},
					'text': {
						'primary': '#E8E2D6',
						'secondary': '#E8E2D660',
						'accent': '#B8A47C',
						'accent-hover': '#D4C8A8',
					},
					'button': {
						'primary': '#B8A47C',
						'primary-hover': '#A89567',
						'danger': '#EF444420',
						'danger-hover': '#EF444430',
						'danger-text': '#EF4444',
						'danger-text-hover': '#DC2626',
					},
					'gradient': {
						'from': '#1E2A3620',
						'via': '#0A0F14',
						'to': '#1E2A3610',
					},
				},
				calendar: {
					'bg': {
						'primary': '#0A0F14',
						'secondary': '#0D1419',
					},
					'hover': {
						'DEFAULT': '#1E2A36',
						'light': '#D4C8A8',
					},
					'border': {
						'primary': '#1E2A36',
						'secondary': 'rgb(30 42 54 / 0.5)',
						'tertiary': 'rgb(30 42 54 / 0.2)',
					},
					'text': {
						'primary': '#E8E2D6',
						'secondary': '#8A8578',
					},
					'accent': {
						'primary': '#B8A47C',
						'light': '#D4C8A8',
						'border': 'rgb(184 164 124 / 0.3)',
					},
					'event': {
						'default': '#039be5',
						'card': {
							'from': '#0f1729',
							'via': '#0f172a',
							'to': '#0c1222',
						},
					},
					'overlay': {
						'DEFAULT': 'rgb(0 0 0 / 0.6)',
						'hover': 'rgb(30 42 54 / 0.3)',
						'light': 'rgb(30 42 54 / 0.1)',
					},
				},
				course: {
					'card': {
						'bg': {
							'DEFAULT': 'rgb(17 24 39 / 0.5)',  // bg-gray-900/50
							'hover': 'rgb(55 65 81 / 0.7)',    // hover:bg-gray-700/70
						},
						'border': {
							'DEFAULT': 'rgb(31 41 55)',       // border-gray-800
							'hover': 'rgb(55 65 81)',         // hover:border-gray-700
						},
						'header': {
							'from': '#4c1d95',               // from-violet-900
							'to': '#1e40af',                 // to-indigo-900
						},
						'text': {
							'primary': '#ffffff',            // text-white
							'secondary': 'rgb(209 213 219)', // text-gray-300
							'muted': 'rgb(156 163 175)',     // text-gray-400
						}
					},
					'difficulty': {
						'beginner': {
							'bg': 'rgb(6 78 59)',           // bg-emerald-950
							'text': 'rgb(52 211 153)',      // text-emerald-400
							'border': 'rgb(6 95 70)',       // border-emerald-800
						},
						'intermediate': {
							'bg': 'rgb(23 37 84)',          // bg-blue-950
							'text': 'rgb(96 165 250)',      // text-blue-400
							'border': 'rgb(30 64 175)',     // border-blue-800
						},
						'advanced': {
							'bg': 'rgb(120 53 15)',         // bg-amber-950
							'text': 'rgb(251 191 36)',      // text-amber-400
							'border': 'rgb(146 64 14)',     // border-amber-800
						},
						'expert': {
							'bg': 'rgb(127 29 29)',         // bg-rose-950
							'text': 'rgb(251 113 133)',     // text-rose-400
							'border': 'rgb(159 18 57)',     // border-rose-800
						}
					},
					'overview': {
						'bg': {
							'DEFAULT': '#ffffff',           // bg-white
							'completed': 'rgb(249 250 251)', // bg-gray-50
							'upcoming': 'rgb(249 250 251)'   // bg-gray-50
						},
						'border': {
							'DEFAULT': 'rgb(243 244 246)',  // border-gray-100
							'hover': 'rgb(229 231 235)',    // hover:border-gray-200
						},
						'text': {
							'primary': 'rgb(17 24 39)',     // text-gray-900
							'secondary': 'rgb(107 114 128)', // text-gray-500
							'accent': '#cbd5e1'             // Default color indicator
						}
					}
				},
			},
			gridTemplateColumns: {
				calendar: '48px repeat(7, 1fr)'
			},
			gridTemplateRows: {
				calendar: '48px repeat(24, 60px)'
			},
			fontFamily: {
				sans: [
					'var(--font-space-grotesk)',
					...(defaultTheme.fontFamily.sans as string[])
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"gradient-x": {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"gradient-x": "gradient-x 15s ease infinite",
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
