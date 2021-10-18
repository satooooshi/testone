const removeImports = require('next-remove-imports');

module.exports = removeImports({
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    PRODUCTION_TYPE: process.env.PRODUCTION_TYPE,
  },
  images: {
    domains: ['storage.googleapis.com'],
  },
  webpack5: false,
});
