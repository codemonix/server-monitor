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

chown -R srm-agent:srm-agent /etc/srm-agent

systemctl daemon-reload

echo "✅ SRM Agent installed!"
echo "👉 Edit /etc/srm-agent/config.json then run: sudo systemctl enable --now srm-agent"