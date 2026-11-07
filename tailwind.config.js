/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        piedra: {
          50: "#F5F3EE", // fondo
          200: "#E4E1D9",
          400: "#8C918D", // bordes, texto secundario
        },
        agua: {
          50: "#EEF5F3",
          100: "#DCEBE7", // fondos suaves
          500: "#3F7F78", // principal
          800: "#1F4E4A", // títulos
        },
        arena: {
          100: "#F4EAD8",
          400: "#D9B77E", // botón principal
          500: "#C9A262",
        },
        tinta: "#23302E", // texto
      },
      fontFamily: {
        titulo: ['"Lora"', "Georgia", "serif"],
        sans: ['"Nunito Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
