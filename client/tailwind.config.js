export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#39FF14", dark: "#00CC66" }, // Cyber Green
        night: "#0b1324"
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0,0,0,0.25)",
        glow: "0 0 20px rgba(57,255,20,0.45), 0 0 40px rgba(57,255,20,0.25)"
      }
    }
  },
  plugins: []
}
