/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000, // ตรวจสอบทุก 1 วินาที
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
