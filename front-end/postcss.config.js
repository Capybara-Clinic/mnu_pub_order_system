// postcss.config.js - 올바른 설정
module.exports = {
  plugins: {
    tailwindcss: {},      // ← 이렇게 변경 (@tailwindcss/postcss 아님!)
    autoprefixer: {},
  },
}