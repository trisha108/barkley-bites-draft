/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "www.barkleybites.com",
      },
      {
        protocol: "https",
        hostname: "barkleybites.com",
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
