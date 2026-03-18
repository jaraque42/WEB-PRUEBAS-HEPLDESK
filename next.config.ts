import type { NextConfig } from "next";

function getSupabaseHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseHost()
      ? [
          {
            protocol: "https",
            hostname: getSupabaseHost()!,
          },
        ]
      : [],
  },
};

export default nextConfig;
