/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                modification: {
                    remove: '#f87171',   // red-400
                    add: '#34d399',      // emerald-400
                    change: '#fb923c',   // orange-400
                    custom: '#fbbf24'    // amber-400
                }
            }
        },
    },
    plugins: [],
}
