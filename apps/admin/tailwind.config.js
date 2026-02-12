/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                menew: {
                    'slate': '#7192A1',
                    'cream': '#EADFCB',
                    'terracotta': '#BC5528',
                    'camel': '#C08E66',
                    'navy': '#042842',
                    'offwhite': '#F3EEE8',
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#042842",
                    foreground: "#F3EEE8",
                },
                secondary: {
                    DEFAULT: "#7192A1",
                    foreground: "#F3EEE8",
                },
                destructive: {
                    DEFAULT: "#BC5528",
                    foreground: "#F3EEE8",
                },
                muted: {
                    DEFAULT: "#EADFCB",
                    foreground: "#042842",
                },
                accent: {
                    DEFAULT: "#C08E66",
                    foreground: "#042842",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.25rem",
            },
        },
    },
    plugins: [],
};
