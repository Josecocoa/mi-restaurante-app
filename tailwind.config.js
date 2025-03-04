/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",          // Escanea el archivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Escanea todos los archivos en src/
  ],
  theme: {
    extend: {}, // Aquí puedes extender la configuración predeterminada de Tailwind
  },
  plugins: [], // Aquí puedes agregar plugins de Tailwind
};