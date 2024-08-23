import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },
  darkMode: "class",

  plugins: [require("@tailwindcss/typography")],
} as Config;
