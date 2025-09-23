module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}'],
      env: { jest: true },
    },
  ],
};
