// Global API base URL helper
// - Local dev: points to localhost
// - Production (GitHub Pages): points to deployed backend URL

window.API_BASE_URL = (function () {
  // Local development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:3002';
  }

  // TODO: Update this once backend is deployed
  // Example: return 'https://central-celulares-api.onrender.com';
  return 'https://your-backend-host.example.com';
})();
