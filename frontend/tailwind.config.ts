import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#021024", deep: "#042933", pine: "#063442", brand: "#093F52",
        steel: "#216485", sky: "#65A7C2", mist: "#C7E5F2",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
