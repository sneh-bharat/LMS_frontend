/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563EB",
                success: "#16A34A",
                danger: "#EF4444",
                softGreen: "#D9F99D",
                softRed: "#FECACA",
                lightGray: "#F3F4F6",
            },
        },
    },
    plugins: [],
};