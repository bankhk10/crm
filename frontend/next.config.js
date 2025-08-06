// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.pravatar.cc'],
  },
    webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every 1 second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },
}

module.exports = nextConfig
