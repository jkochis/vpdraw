<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# VPDraw - Graph Paper Layout Designer

## Project Overview
This is a TypeScript web application built with Vite that provides a graph paper drawing tool for designing layouts using viewport units (vh/vw). The tool helps designers create responsive layouts with real-time CSS generation.

## Architecture
- **Vite + TypeScript**: Modern build tooling for fast development
- **Konva.js**: 2D canvas library for drawing and interaction
- **Modular Architecture**: Organized into managers for different concerns

## Key Components
- `VPDrawApp`: Main application controller
- `ToolManager`: Handles drawing tools (select, rectangle, text)
- `ElementManager`: Manages canvas elements and their properties
- `ViewportManager`: Handles viewport unit calculations and conversions
- `GridManager`: Manages the graph paper grid display
- `PropertiesPanel`: UI for editing element properties
- `CSSExporter`: Generates responsive CSS using vh/vw units
- `EventManager`: Handles keyboard shortcuts and global events

## Coding Guidelines
1. Use TypeScript strict mode
2. Follow modular architecture patterns
3. Prefer composition over inheritance
4. Use viewport units (vh/vw) for responsive design
5. Maintain separation of concerns between managers
6. Use event-driven communication between components
7. Implement proper error handling and null checks

## Key Features
- Graph paper grid with adjustable size
- Drawing tools for rectangles and text elements
- Real-time property editing
- Viewport unit calculations (px to vh/vw conversion)
- CSS generation with responsive units
- Keyboard shortcuts for productivity
- Snap-to-grid functionality

## CSS and Styling
- Uses CSS custom properties for theming
- Responsive design with viewport units
- Modern flexbox/grid layouts
- Component-based styling approach

## Development Commands
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
