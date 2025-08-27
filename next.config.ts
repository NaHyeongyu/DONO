import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Next doesn't infer the workspace root incorrectly
  outputFileTracingRoot: path.resolve(__dirname),
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
