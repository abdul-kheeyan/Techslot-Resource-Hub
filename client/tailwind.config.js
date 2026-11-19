/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#11141c",
        line: "#242936",
        accent: "#9b8cff",
      },
    },
  },
  plugins: [],
};
