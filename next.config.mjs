/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: {},
};

export default function(phase, { defaultConfig }) {
  return nextConfig;
}
