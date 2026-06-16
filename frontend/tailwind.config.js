export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Microsoft YaHei", "PingFang SC", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 28px rgba(34, 211, 238, 0.35)",
        boss: "0 0 34px rgba(244, 63, 94, 0.45)",
      },
    },
  },
  plugins: [],
};
