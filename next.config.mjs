/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co", // AniList image domain
      }
      
    ], 
  },
};

export default nextConfig;
