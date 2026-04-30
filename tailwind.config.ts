import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "#F7F4EE",
        section: "#F1ECE3",
        card: "#FFFFFF",
        primary: "#3B82F6",
      },
    },
  },
  plugins: [],
};

export default config;
