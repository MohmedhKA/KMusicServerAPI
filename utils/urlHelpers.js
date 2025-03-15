const ensureHttps = (url) => {
  if (url && typeof url === 'string' && url.startsWith('http:')) {
    return url.replace('http:', 'https:');
  }
  return url;
};

const generateUrl = (path, type) => {
  const baseUrl = process.env.BASE_URL || 'https://100.102.217.22:3000';
  return `${baseUrl}/${type}/${encodeURIComponent(path)}`;
};

module.exports = {
  ensureHttps,
  generateUrl
};