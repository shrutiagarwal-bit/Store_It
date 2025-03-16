import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
       
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
     
        {
          protocol: "https",
          hostname: "kansai-resilience-forum.jp",
          pathname: "/wp-content/uploads/**",
        },
    ],
  },
};

export default nextConfig;