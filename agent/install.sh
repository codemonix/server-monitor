#!/usr/bin/env bash
# Usage: curl -sSL https://.../install.sh | sudo bash -s -- --key=YOUR_KEY
set -e

REPO="codemonix/server-monitor"
TEMP_DEB="/tmp/srm-agent.deb"

echo "🔎 Searching for the latest SRM Agent release..."

DOWNLOAD_URL=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep "browser_download_url" | grep "amd64.deb" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')

if [[ ! $DOWNLOAD_URL =~ ^https:// ]]; then
    echo "❌ Error: Found invalid URL: $DOWNLOAD_URL"
    echo "Make sure the 'https:' scheme isn't being cut off."
    exit 1
fi


if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Could not find the latest release. Exiting."
    exit 1
fi

echo "🧹 Cleaning up old download files..."
sudo rm -f "$TEMP_DEB"



echo "📥 Downloading SRM Agent ..."
wget --continue --show-progress -O "$TEMP_DEB" "$DOWNLOAD_URL"

if [ ! -s "$TEMP_DEB" ]; then
    echo "❌ Download failed or file is empty. Exiting."
    exit 1
fi

echo "📦 Installing srm-agent..."
sudo apt install -y "$TEMP_DEB"

# Instructions
echo ""
echo "--------------------------------------------------------"
echo "✅ SRM Agent installed successfully!"
echo "--------------------------------------------------------"
echo "Next steps:"
echo "1. Configure your key:"
echo "   sudo nano /etc/srm-agent/config.json"
echo ""
echo "2. Start the service:"
echo "   sudo systemctl enable --now srm-agent"
echo ""
echo "3. Check status:"
echo "   sudo systemctl status srm-agent"
echo "--------------------------------------------------------"

# Cleanup
rm "$TEMP_DEB"