const nextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true, // 👈 disables ESLint errors from blocking build
  },
};

export default nextConfig;
