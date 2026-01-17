#!/bin/bash
set -e

if systemctl is-active --quiet srm-agent; then
    echo "Stopping srm-agent service..."
    systemctl stop srm-agent
fi

if systemctl is-enabled --quiet srm-agent; then
    echo "Disabling srm-agent service..."
    systemctl disable srm-agent
fi

systemctl daemon-reload

echo "SRM Agent is Ready to be removed."