/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "neaprecisionskin.com", pathname: "/wp-content/**" },
    ],
  },
  async redirects() {
    // Keep every old WordPress URL working after the relaunch (SEO equity).
    return [
      { source: "/our-treatments-skin-health", destination: "/treatments?focus=skin", permanent: true },
      { source: "/our-treatments-health-wellness", destination: "/treatments?focus=wellness", permanent: true },
      { source: "/our-treatments-fitness", destination: "/treatments?focus=body", permanent: true },
      { source: "/our-treatments-arthritis", destination: "/packages#arthritis", permanent: true },
      { source: "/our-treatments-injectables", destination: "/treatments?focus=injectables", permanent: true },
      { source: "/our-treatments-feminine-health", destination: "/treatments/feminine-health", permanent: true },
      { source: "/our-treatments-microbiome-testing", destination: "/microbiome", permanent: true },
      { source: "/wellness-packages", destination: "/packages", permanent: true },
      { source: "/weight-loss-program", destination: "/weight-loss", permanent: true },
      { source: "/fotona-laser", destination: "/fotona", permanent: true },
      { source: "/our-biogut-nutrition-clinic", destination: "/nutrition", permanent: true },
      { source: "/our-mission", destination: "/about#mission", permanent: true },
      { source: "/frequently-asked-questions", destination: "/faq", permanent: true },
      { source: "/consultation", destination: "/book", permanent: true },
      { source: "/clinic-gallery", destination: "/gallery", permanent: true },
      { source: "/download-nea-magazine", destination: "/magazine", permanent: true },
      { source: "/get-bionow-magazine", destination: "/magazine#bionow", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-of-service", destination: "/terms", permanent: true },
      { source: "/coupon20", destination: "/skin-scan", permanent: false },
    ];
  },
};

export default nextConfig;
