require("@testing-library/jest-dom")
process.env.BLITZ_TEST_ENVIRONMENT = true

// TODO - remove once https://github.com/vercel/next.js/issues/18415 is fixed
process.env = {
  ...process.env,
  __NEXT_IMAGE_OPTS: {
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [],
    domains: ["images.example.com"],
    path: "/_next/image",
    loader: "default",
  },
}
