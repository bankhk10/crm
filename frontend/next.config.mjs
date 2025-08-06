/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option is for production builds.
  output: 'standalone',

  // This configuration enables hot-reloading inside Docker.
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every 1 second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },

  // This is the crucial fix:
  // We are telling Next.js that it's safe to load images from this domain.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
