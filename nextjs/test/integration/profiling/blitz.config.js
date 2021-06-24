module.exports = {
  target: 'serverless',
  experimental: {
    profiling: true,
  },
  onDemandEntries: {
    // Make sure entries are not getting disposed.
    maxInactiveAge: 1000 * 60 * 60,
  },
}
