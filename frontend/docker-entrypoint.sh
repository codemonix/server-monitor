#!/bin/sh

echo "Generating Runtime Config..."
envsubst < /usr/share/nginx/html/runtime-config.js.tpl > /usr/share/nginx/html/config.js

echo "Starting Nginx..."
exec "$@"