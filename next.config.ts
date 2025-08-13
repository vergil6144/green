import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["upload.wikimedia.org", "images.unsplash.com", 'pngimg.com', 'png.pngtree.com', 'freshfruitandvegshop.com'], // allowed external image domains
  },
};

export default nextConfig;
