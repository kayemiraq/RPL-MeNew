/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
