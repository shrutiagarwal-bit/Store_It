import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript:{
    ignoreBuildErrors: true
  },
  eslint:{
    ignoreDuringBuilds:true ,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },
 
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
        hostname: "img.freepik.com",
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