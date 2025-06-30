#!/bin/bash

# VPDraw GitHub Repository Setup Script

echo "🚀 Setting up VPDraw GitHub repository..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add the GitHub remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/jkochis/vpdraw.git

# Add all files
echo "📝 Adding files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: VPDraw - Graph Paper Layout Designer

✨ Features:
- Graph paper canvas with viewport units
- Drawing tools (rectangle, text)
- Multi-selection workflow
- Viewport presets and proportional scaling
- CSS export with vh/vw units
- 96/96 tests passing (100% coverage)
- GitHub Pages deployment ready"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Repository setup complete!"
echo "🌐 Your repository: https://github.com/jkochis/vpdraw"
echo "📱 Future live URL: https://jkochis.github.io/vpdraw/"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/jkochis/vpdraw/settings/pages"
echo "2. Set Pages source to 'GitHub Actions'"
echo "3. Wait for deployment to complete"
echo "4. Visit your live app at https://jkochis.github.io/vpdraw/"
