#!/bin/bash
# Usage: ./release-agent.sh <version> 

read -p "Enter version (e.g. 1.0.0): " VERSION

if [ -z "$VERSION" ]; then
    echo "Usage: ./release-agent.sh <version>"
    exit 1
fi
TAG="agent-v$VERSION"

echo "📦 Preparing release for $TAG..."

git add .

git commit -m "Release Agent version $VERSION" 

git push origin main

echo "🏷️ Creating tag $TAG..."
git tag $TAG
git push origin $TAG

echo "✅ Done! Check your GitHub Actions tab to watch the build."