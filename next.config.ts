import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub
      { protocol: 'https', hostname: 'www.gravatar.com' }, // Gravatar
      { protocol: 'https', hostname: 's.gravatar.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' }, // Facebook
      { protocol: 'https', hostname: 'cdn.discordapp.com' }, // Discord
    ],
  },
};

export default nextConfig;
