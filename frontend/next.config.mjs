/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option is crucial for the Docker production image.
  // It tells Next.js to create a standalone folder with only
  // the necessary files for production, making the image smaller.
  output: 'standalone',
};

export default nextConfig;
