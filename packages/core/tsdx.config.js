module.exports = {
  rollup(config, options) {
    config.external('@prisma/client');
    return config;
  },
};
