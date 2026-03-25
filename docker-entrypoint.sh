#!/bin/sh
cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",
  VITE_API_KEY: "${VITE_API_KEY:-}",
  VITE_HMAC_SECRET: "${VITE_HMAC_SECRET:-}"
};
EOF

exec nginx -g 'daemon off;'
