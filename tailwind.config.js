/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#42b983",
        secondary: "#35495e",
        tertiary: "#41b883",
        grey: "#64748b",
        dark: "#1e293b",
        white: "#fff",
        sidebar: "#F9F9F9", // Custom color for sidebar width
        light: "#f5f5f5",
        pinkDark: "#C58189",
        pinkDark2: "#c36d77",
        pinkMed: "#D19499",
        pinkLight: "#F0BAB3",
        bgWhite: "#F9F9F9",
        pinkGray: "#FAF1EC",
        pinkOrange: "#C26872",
        orangeLight: "#FCF8F5",
      },
      backgroundImage: {
        "gradient-pink": "linear-gradient(45deg, #C58189, #F0BAB3)",
      },
    },
  },
  plugins: [],
};
