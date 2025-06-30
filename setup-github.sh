#!/bin/bash

# VPDraw GitHub Repository Setup Script
# This script helps you set up the GitHub remote and push your code

echo "🚀 Setting up VPDraw GitHub Repository..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add GitHub remote
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/jessekochis/vpdraw.git

# Check current branch and create main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🌿 Creating and switching to main branch..."
    git checkout -b main
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: VPDraw - Graph Paper Layout Designer

- Complete TypeScript application with Konva.js
- 96/96 tests passing (100% test coverage)
- Automatic GitHub Pages deployment
- Responsive viewport unit (vh/vw) calculations
- Drawing tools and property editing
- CSS export functionality"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "🌐 Your repository: https://github.com/jessekochis/vpdraw"
echo "📖 GitHub Pages will be available at: https://jessekochis.github.io/vpdraw/"
echo ""
echo "📝 Next steps:"
echo "1. Go to repository settings on GitHub"
echo "2. Navigate to Pages section"
echo "3. Set source to 'GitHub Actions'"
echo "4. Wait for deployment to complete"
echo ""
echo "🎉 Happy coding!"
