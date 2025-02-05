import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
      },
      gridTemplateColumns: {
        'calendar': '48px repeat(7, 1fr)',
      },
      gridTemplateRows: {
        'calendar': '48px repeat(24, 60px)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
