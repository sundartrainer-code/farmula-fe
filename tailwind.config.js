export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        ink: "#070d18",
        panel: "#0f1c30",
        line: "#223756",
        brand: "#42d3ff",
        violet: "#8b5cf6"
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0,0,0,.38)"
      }
    }
  },
  plugins: []
}
