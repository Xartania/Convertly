import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10141f",
        slatewash: "#f3f6f8",
        aqua: "#1f9f93",
        saffron: "#f6b94d",
        signal: "#4461f2"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        lift: "0 18px 50px rgba(16, 20, 31, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
