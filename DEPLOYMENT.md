# VPDraw Deployment Guide

## Quick Setup for GitHub Pages

### 1. Repository Setup
Ensure your repository is public or you have GitHub Pro for private repo Pages.

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section in sidebar
4. Under **Source**, select **GitHub Actions**

### 3. Deploy
Simply push to the `main` branch:

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
- ✅ Install dependencies
- ✅ Run TypeScript type checking
- ✅ Execute all 96 tests
- ✅ Build the production bundle
- ✅ Deploy to GitHub Pages

### 4. Access Your App
After deployment completes (usually 2-3 minutes), your app will be available at:
```
https://jkochis.github.io/vpdraw/
```

## Manual Deployment Alternative

If you prefer manual control:

```bash
# Build and deploy in one command
pnpm deploy

# Or step by step
pnpm build
npx gh-pages -d dist
```

## Configuration Details

### Vite Configuration
- **Base Path**: `/vpdraw/` (matches repository name)
- **Asset Optimization**: Minification with Terser
- **Code Splitting**: Konva.js separated for caching
- **Source Maps**: Generated for debugging

### GitHub Actions Workflow
- **Trigger**: Push to main branch
- **Node Version**: 20.x (LTS)
- **Package Manager**: pnpm
- **Build Steps**: Type check → Tests → Build → Deploy
- **Permissions**: Configured for Pages deployment

### Testing Integration
- All 96 tests must pass before deployment
- Type checking ensures code quality
- Automated testing prevents broken deployments

## Troubleshooting

### Common Issues

**Build Fails**
- Check TypeScript errors: `pnpm type-check`
- Run tests locally: `pnpm test --run`

**404 on Deployment**
- Verify base path in `vite.config.ts` matches repo name
- Check GitHub Pages settings in repository

**Assets Not Loading**
- Ensure all imports use relative paths
- Check console for CORS errors

### Local Testing

Test the production build locally:

```bash
# Build and preview
pnpm build
pnpm preview

# Open http://localhost:4173/vpdraw/
```

## Performance Optimizations

The deployment includes several optimizations:

- **Code Splitting**: Konva.js separated for better caching
- **Asset Compression**: Gzip compression enabled
- **Source Maps**: Available for debugging without bloating main bundle
- **Tree Shaking**: Unused code eliminated
- **Minification**: JavaScript and CSS optimized for size

Your VPDraw app will be production-ready and optimized for performance! 🚀
