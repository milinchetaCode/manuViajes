// config/env.js
// Centralized environment/config validation
const required = [
  'XS2EVENT_API_KEY',
  'ADMIN_USER',
  'ADMIN_PASS',
  'SESSION_SECRET',
  'GITHUB_TOKEN',
  'GIST_PACKAGES_ID',
  'GIST_DESTACADOS_ID'
];

function getConfig() {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error('Missing required env vars: ' + missing.join(', '));
  }
  return {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET,
    xs2EventApiKey: process.env.XS2EVENT_API_KEY,
    xs2EventMarkup: process.env.XS2EVENT_MARKUP || '0',
    githubToken: process.env.GITHUB_TOKEN,
    gistPackagesId: process.env.GIST_PACKAGES_ID,
    gistDestacadosId: process.env.GIST_DESTACADOS_ID,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    }
  };
}

module.exports = { getConfig };
