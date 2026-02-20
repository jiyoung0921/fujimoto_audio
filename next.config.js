/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
    },
    // API Route body size limit for large audio file uploads
    api: {
        bodyParser: {
            sizeLimit: '500mb',
        },
        responseLimit: false,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('better-sqlite3');
        }
        return config;
    },
    reactStrictMode: false,
}

module.exports = nextConfig
