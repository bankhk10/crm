/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        // pathname: '/**',   // ใส่ถ้าต้องการจำกัด path (ตัวอย่าง)
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // ถ้าคุณยังต้องการโหมด polling สำหรับ Docker:
  // webpackDevMiddleware: (config) => {
  //   config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
  //   return config;
  // },
};

module.exports = nextConfig;
