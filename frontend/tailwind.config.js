/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff2eb",
          100: "#ffe2d3",
          200: "#ffc2a8",
          300: "#ff9b73",
          400: "#ff6d33",
          500: "#ff4d00",
          600: "#e04400",
          700: "#b83600",
          800: "#8f2b00",
          900: "#6b2000"
        },
        surface: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#121212",
          700: "#181818"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,77,0,0.18), 0 10px 40px rgba(255,77,0,0.16)",
        soft: "0 10px 30px rgba(0,0,0,0.25)"
      },
      backgroundImage: {
        "radial-brand":
          "radial-gradient(circle at center, rgba(255,77,0,0.22), transparent 55%)",
        "hero-grid":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pulseSlow: "pulseSlow 4s ease-in-out infinite",
        marqueeGlow: "marqueeGlow 8s linear infinite"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.06)" }
        },
        marqueeGlow: {
          "0%": { transform: "translateX(-8%)" },
          "50%": { transform: "translateX(8%)" },
          "100%": { transform: "translateX(-8%)" }
        }
      }
    }
  },
  plugins: []
};
