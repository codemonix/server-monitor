#!/usr/bin/env bash

set -e
# Dedicate system user
if ! id "srm-agent" &>/dev/null; then
    echo "Creating srm-agent user..."
    useradd --system --no-create-home --shell /bin/false srm-agent
fi

# Data Directory owned by srm-agent
echo "Setting up SRM Agent data directory..."
mkdir -p /var/lib/srm-agent/data
chown -R srm-agent:srm-agent /var/lib/srm-agent
chmod 700 /var/lib/srm-agent/data
chown root

# Config file (settings) Owned by root read-only for srm-agent
if [ -f /etc/srm-agent/config.json ]; then
    chown root:root /etc/srm-agent/config.json
    chmod 644 /etc/srm-agent/config.json
else
    echo "Config file not found!" 
fi


# Reload and enable service
echo "Enabling and starting srm-agent service..."
systemctl daemon-reload
systemctl enable srm-agent



echo "✅ SRM Agent installed!"
echo "👉 Edit /etc/srm-agent/config.json then run: sudo systemctl enable --now srm-agent"