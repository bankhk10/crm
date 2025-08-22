// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ลบหรือย้าย webpackDevMiddleware ไปไว้ใน custom server (เฉพาะ development เท่านั้น)
};

module.exports = nextConfig;