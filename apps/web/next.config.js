const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    config.module.rules = [
      ...config.module.rules,
      // ensure our libs barrel files don't constitute imports
      {
        test: /blitz/i,
        sideEffects: false,
      },
    ];
    return config;
  },
});
