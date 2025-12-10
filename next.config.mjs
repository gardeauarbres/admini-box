
const withPWA = (await import('next-pwa')).default({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
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

export default withPWA(nextConfig);
