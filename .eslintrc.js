module.exports = {
  extends: ["airbnb-typescript/base"],
  env: {
    "jest": true
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "prefer-default-export": false,
  }
};