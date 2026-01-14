#!/usr/bin/env bash

set -e
# Dedicate system user
if ! id "srm-agent" &>/dev/null; then
    echo "Creating srm-agent user..."
    useradd --system --no-create-home --shell /bin/false srm-agent
fi

# Setup Directories
# /etc/srm-agent (Config - root owned, Agent readable)
mkdir -p /etc/srm-agent
# chmod 755 /etc/srm-agent
chown -R srm-agent:srm-agent /etc/srm-agent

# /var/lib/srm-agent (Data - owned by srm-agent)
# mkdir -p /var/lib/srm-agent/data
# mkdir -p /var/lib/srm-agent/data-queue

# permissions 
# chown -R srm-agent:srm-agent /var/lib/srm-agent
# chmod 700 /var/lib/srm-agent

# Reload systemd
systemctl daemon-reload

cho "✅ SRM Agent installed!"
echo "👉 Edit /etc/srm-agent/config.json then run: sudo systemctl enable --now srm-agent"