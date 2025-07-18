/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is a workaround for a build issue with Genkit and its dependencies.
    // These packages are not meant to be bundled by webpack for the server.
    if (isServer) {
      config.externals = [
        ...config.externals,
        'handlebars',
        '@opentelemetry/api',
        '@opentelemetry/sdk-trace-base',
      ];
    }

    return config;
  },
};

module.exports = nextConfig;
