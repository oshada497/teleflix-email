/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html",
    ],
    theme: {
        extend: {
            colors: {
                background: "#121212",
                surface: "#1a1a1a",
                "surface-highlight": "#222222",
                border: "#2a2a2a",
                primary: "#6366f1",
                "primary-hover": "#4f46e5",
                secondary: "#a1a1aa",
                muted: "#71717a",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
