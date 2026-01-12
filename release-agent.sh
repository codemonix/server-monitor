#!/bin/bash
# Usage: ./release-agent.sh <version> 

if [ -z "$1" ]; then
  echo "Usage: ./release-agent.sh <version>"
  exit 1
fi

VERSION=$1
TAG="agent-v$VERSION"

echo "📦 Preparing release for $TAG..."
git tag -a "$TAG" -m "Agent Realease $VERSION"
git push origin "$TAG"
echo "🚀 Tag pushed! GitHub Actions is now building your release."