import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: true, // process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.gardeauarbres.fr',
                pathname: '/assets/images/**',
            },
        ],
    },
};

// export default withPWA(nextConfig);
export default nextConfig;
