/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@menew/shared"],
    images: {
        domains: ["localhost"],
    },
};

module.exports = nextConfig;
