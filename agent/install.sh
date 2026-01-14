#!/usr/bin/env bash
# Usage: curl -sSL https://.../install.sh | sudo bash -s -- --key=YOUR_KEY
set -e

REPO="codemonix/server-monitor"
TEMP_DEB="/tmp/srm-agent.deb"

echo "🔎 Searching for the latest SRM Agent release..."

DOWNLOAD_URL=$(curl -s https://api.github.com/repos/$REPO/releases/latest | \
    grep "browser_download_url.*amd64.deb" | \
    cut -d : -f 2,3 | tr -d \")

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Could not find the latest release. Exiting."
    exit 1
fi

echo "📥 Downloading SRM Agent ..."
wget -qO "$TEMP_DEB" "$DOWNLOAD_URL"

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