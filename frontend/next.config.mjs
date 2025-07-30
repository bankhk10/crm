/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option is crucial for the Docker production image.
  // It creates a standalone folder with only the necessary dependencies,
  // making the final image much smaller and more secure.
  output: 'standalone',
};

export default nextConfig;
