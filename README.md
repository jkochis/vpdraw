# VPDraw - Graph Paper Layout Designer

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=flat-square)](https://jkochis.github.io/vpdraw/)
[![Tests](https://img.shields.io/badge/Tests-96%2F96%20passing-brightgreen?style=flat-square)](https://github.com/jkochis/vpdraw/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

A modern TypeScript web application for designing responsive layouts using viewport units (vh/vw). VPDraw provides an intuitive graph paper interface where designers can create elements and automatically generate CSS with viewport-based measurements.

## 🚀 Features

- **Graph Paper Canvas**: Adjustable grid for precise layout design
- **Drawing Tools**: Rectangle and text tools with real-time editing
- **Multi-Selection**: Select and manipulate multiple elements simultaneously
- **Viewport Presets**: Quick switching between common device sizes (Desktop, iPad, iPhone, etc.)
- **Orientation Toggle**: Switch between portrait and landscape modes instantly
- **Proportional Scaling**: Elements automatically scale proportionally when switching viewports or orientations
- **Grid Snapping**: Elements automatically snap to grid for precise alignment
- **Viewport Units**: Automatic conversion from pixels to vh/vw units
- **Property Panel**: Live editing of element properties with instant viewport unit feedback
- **CSS Generation**: Export responsive CSS with viewport units
- **Keyboard Shortcuts**: Productive workflow with keyboard shortcuts
- **Real-time Preview**: See changes instantly as you design

## 🛠️ Tech Stack

- **Frontend**: TypeScript, Vite
- **Canvas**: Konva.js for 2D graphics and interactions
- **Styling**: CSS Custom Properties, Viewport Units
- **Build Tool**: Vite with hot module replacement
- **Package Manager**: pnpm

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/jkochis/vpdraw.git
cd vpdraw

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🎯 Usage

### Basic Drawing
1. The app starts with an Android viewport (360×640) for mobile-first design
2. Select a tool from the toolbar (Rectangle or Text)
3. Click and drag on the canvas to create elements
4. Use the Select tool to modify existing elements

### Multi-Selection
- **Selection Rectangle**: Click and drag on empty canvas to draw a selection rectangle around multiple elements
- **Ctrl/Cmd + Click**: Hold Ctrl (Windows) or Cmd (Mac) while clicking elements to add/remove them from selection
- **Group Operations**: Selected elements move together when dragging any selected element
- **Bulk Delete**: Press Delete/Backspace to remove all selected elements
- **Select All**: Press Ctrl/Cmd + A to select all elements on canvas

### Property Editing
- Select any element to view its properties in the right panel
- Edit position, size, colors, and text properties
- View real-time viewport unit conversions (vh/vw)

### Viewport Controls
- **Default**: App starts with Android viewport (360×640) for mobile-first design
- **Canvas Size**: Manually adjust viewport dimensions using width/height inputs
- **Device Presets**: Select from common device presets (Desktop HD, iPad, iPhone, Android, etc.)
- **Orientation Toggle**: Click the orientation button or press `R` to switch between portrait/landscape
- **Proportional Scaling**: When changing viewport size or orientation, all elements automatically scale proportionally to maintain their relative positions and sizes
- **Real-time Updates**: Canvas and grid update instantly when viewport changes

### Grid Controls
- Adjust grid size with the slider (10px - 50px)
- Toggle "Snap to Grid" for precise alignment
- Grid helps visualize responsive breakpoints

### CSS Export
- Click "Export CSS" to copy responsive CSS to clipboard
- Generated CSS uses vh/vw units for true responsiveness
- Includes both CSS and HTML markup

### Keyboard Shortcuts
- `1` - Select tool
- `2` - Rectangle tool  
- `3` - Text tool
- `4-9` - Quick preset selection
- `R` - Toggle portrait/landscape orientation
- `Delete/Backspace` - Delete selected element(s)
- `G` - Toggle snap to grid
- `Ctrl/Cmd + A` - Select all elements
- `Ctrl/Cmd + E` - Export CSS

## 🏗️ Architecture

```
src/
├── app/
│   ├── VPDrawApp.ts          # Main application controller
│   ├── elements/             # Element management
│   │   └── ElementManager.ts
│   ├── tools/                # Drawing tools
│   │   └── ToolManager.ts
│   ├── viewport/             # Viewport calculations
│   │   └── ViewportManager.ts
│   ├── grid/                 # Grid management
│   │   └── GridManager.ts
│   ├── ui/                   # User interface
│   │   └── PropertiesPanel.ts
│   ├── export/               # CSS generation
│   │   └── CSSExporter.ts
│   └── events/               # Event handling
│       └── EventManager.ts
├── style.css                # Global styles
└── main.ts                  # Application entry point
```

## 🎨 Design Philosophy

VPDraw follows several key principles:

- **Viewport-First**: Everything is measured in viewport units for true responsiveness
- **Real-time Feedback**: Instant visual feedback for all changes
- **Multi-Selection Workflow**: Efficient bulk operations with intuitive selection methods
- **Modular Architecture**: Clean separation of concerns
- **Designer-Friendly**: Intuitive interface for design workflows
- **Code Generation**: Produces clean, maintainable CSS

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Type checking
pnpm type-check

# Deploy to GitHub Pages (manual)
pnpm deploy
```

## 🚀 Deployment

VPDraw is configured for automatic deployment to GitHub Pages.

### Automatic Deployment

The app automatically deploys to GitHub Pages when you push to the `main` branch:

1. **Push to main branch** - Triggers automatic deployment
2. **GitHub Actions** - Runs tests, builds, and deploys
3. **Live URL** - Available at `https://jkochis.github.io/vpdraw/`

### Manual Deployment

You can also deploy manually using:

```bash
# Build and deploy to gh-pages branch
pnpm deploy
```

### Setting up GitHub Pages

1. **Go to your GitHub repository settings**
2. **Navigate to Pages section**
3. **Set Source to "GitHub Actions"**
4. **Push to main branch** - First deployment will set up the pages

### Build Configuration

- **Base Path**: Configured for `/vpdraw/` repository path
- **Asset Optimization**: Minified with source maps
- **Code Splitting**: Konva.js separated for better caching
- **CI/CD**: Automated testing and deployment

## 🧪 Testing

VPDraw includes comprehensive unit and integration tests to ensure code quality and reliability.

### Test Coverage

- **Unit Tests**: Individual component testing for all core managers
- **Integration Tests**: Cross-component functionality and data flow
- **Performance Tests**: Efficiency testing for viewport calculations and scaling operations
- **Error Handling**: Graceful handling of edge cases and invalid inputs

### Test Structure

```
src/test/
├── setup.ts                 # Test configuration and mocks
├── ViewportManager.test.ts   # Viewport unit calculations
├── ViewportPresets.test.ts   # Device presets and scaling
├── GridManager.test.ts       # Grid functionality
├── ToolManager.test.ts       # Drawing tools
├── CSSExporter.test.ts       # CSS generation
└── integration.test.ts       # End-to-end functionality
```

### Running Tests

```bash
# Run all tests once
pnpm test --run

# Run tests in watch mode
pnpm test

# Run specific test file
pnpm test ViewportManager.test.ts

# Run tests with coverage
pnpm test:coverage

# Open test UI
pnpm test:ui
```

### Test Features

- **Vitest**: Fast unit testing framework with Vite integration
- **Happy DOM**: Lightweight DOM simulation for browser environment testing
- **Mocking**: Comprehensive mocks for Konva.js canvas operations
- **Coverage Reports**: Detailed code coverage analysis
- **Performance Testing**: Automated performance benchmarks

### Project Structure

The application uses a modular architecture with clear separation of concerns:

- **Managers**: Handle specific aspects (tools, elements, viewport, etc.)
- **Event-Driven**: Components communicate through events
- **TypeScript**: Full type safety throughout the application
- **Responsive**: Built mobile-first with viewport units

## ⚡ Proportional Scaling

One of VPDraw's key features is automatic proportional scaling of elements when viewport dimensions change. This ensures your designs maintain their intended proportions across different screen sizes.

### How It Works
- **Orientation Changes**: When toggling between portrait and landscape, elements scale to maintain their relative size and position
- **Preset Switching**: Changing between device presets (e.g., iPhone to iPad) scales all elements proportionally
- **Manual Resizing**: Adjusting canvas width/height manually also triggers proportional scaling
- **Font Scaling**: Text elements scale their font size proportionally while maintaining a minimum readable size

### Smart Scaling Algorithm
- Calculates scale factors based on width and height ratios
- Maintains aspect ratios while adapting to new viewport dimensions
- Preserves grid snapping after scaling operations
- Uses average scaling for font sizes to maintain readability

## 🎯 Viewport Units

VPDraw specializes in viewport units for responsive design:

- **vw**: 1% of viewport width
- **vh**: 1% of viewport height  
- **Responsive**: Elements scale with browser size
- **Consistent**: Same proportions across all devices

## 🤝 Contributing

1. Fork the repository: https://github.com/jkochis/vpdraw
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Konva.js** for excellent 2D canvas capabilities
- **Vite** for lightning-fast development experience
- **TypeScript** for type safety and developer experience
- **Vitest** for fast and reliable testing framework

## 📋 Testing

VPDraw includes comprehensive unit and integration tests covering all major functionality.

```bash
# Run all tests
pnpm test

# Coverage report
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Current Status**: **96/96 tests passing (100%)** with complete coverage of:
- ✅ **ViewportManager** (19 tests) - Viewport calculations and transformations
- ✅ **ViewportPresets** (29 tests) - Device presets and scaling  
- ✅ **ToolManager** (20 tests) - Drawing tools and interactions
- ✅ **CSSExporter** (15 tests) - CSS/HTML export functionality
- ✅ **GridManager** (3 tests) - Grid operations and snapping
- ✅ **Integration** (10 tests) - Cross-component workflows

See [TESTING.md](./TESTING.md) for detailed testing documentation.
