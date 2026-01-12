#!/usr/bin/env bash
# Usage: curl -sSL https://.../install.sh | sudo bash -s -- --key=YOUR_KEY
set -e

# Parse arguments
ENROLLMENT_KEY=$(echo "$@" | grep -oP '(?<=--key=)[^ ]+')
if [ -z "$ENROLLMENT_KEY" ]; then
    echo "❌ Error: --key=YOUR_KEY is required."
    exit 1
fi

echo "Installing SRM Agent..."

# Downloading latest release .deb
echo "🔎 Fetching latest release..."
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/server-monitor/releases/latest | \
        grep browser_download_url.*amd64.deb | 
        cut -d : -f 2,3 | tr -d \") 

wget -qO /tmp/srm-agent.deb "$DOWNLOAD_URL"

# Install (postinstall.sh)
dpkg -i /tmp/srm-agent.deb

# Write Configurations
echo "🔑 Configuring agent..."
cat <<EOF > /etc/srm-agent/config.json
{
    "backendBaseUrl": "http://localhost:4000/api",
    "wsUrl": "http://localhost:4000/ws",
    "enrollmentKey": "$ENROLLMENT_KEY"
}
EOF

# Config permissions 
chmon 644 /etc/srm-agent/config.json

# Start Service
systemctl enable --now srm-agent
echo "✅ Agent v$(srm-agent --version 2>/dev/null || echo 'installed') is running!"