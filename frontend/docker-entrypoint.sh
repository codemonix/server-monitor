#!/bin/sh


echo "Generating Runtime Config..."

echo "DEBUG: API_BASE_URL is set to: '$API_BASE_URL'"
echo "DEBUG: WS_BASE_URL is set to: '$WS_BASE_URL'"


envsubst < /usr/share/nginx/html/runtime-config.js.tpl > /usr/share/nginx/html/config.js

echo "Starting Nginx..."
exec "$@"