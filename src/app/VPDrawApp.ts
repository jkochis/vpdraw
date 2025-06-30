import Konva from 'konva';
import { ToolManager } from './tools/ToolManager';
import { ViewportManager } from './viewport/ViewportManager';
import { ViewportPresets } from './viewport/ViewportPresets';
import { GridManager } from './grid/GridManager';
import { ElementManager } from './elements/ElementManager';
import { PropertiesPanel } from './ui/PropertiesPanel';
import { CSSExporter } from './export/CSSExporter';
import { EventManager } from './events/EventManager';

export class VPDrawApp {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private toolManager: ToolManager | null = null;
  private viewportManager: ViewportManager | null = null;
  private gridManager: GridManager | null = null;
  private elementManager: ElementManager | null = null;
  private propertiesPanel: PropertiesPanel | null = null;
  private cssExporter: CSSExporter | null = null;
  private eventManager: EventManager | null = null; // Used for keyboard shortcuts
  private viewportPresets: ViewportPresets = new ViewportPresets();

  public initialize(): void {
    this.setupCanvas();
    this.initializeManagers();
    this.setupEventListeners();
    this.updateViewportInfo();
    
    // Initialize orientation icon
    const { width, height } = this.getCanvasSize();
    this.updateOrientationIcon(width, height);
  }

  private setupCanvas(): void {
    const container = document.getElementById('konva-container');
    if (!container) {
      throw new Error('Canvas container not found');
    }

    // Set initial canvas size from viewport manager
    const { width, height } = this.getCanvasSize();
    
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    
    this.stage = new Konva.Stage({
      container: 'konva-container',
      width: width,
      height: height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  private getCanvasSize(): { width: number; height: number } {
    const canvasWidthInput = document.getElementById('canvas-width') as HTMLInputElement;
    const canvasHeightInput = document.getElementById('canvas-height') as HTMLInputElement;
    
    const width = canvasWidthInput ? parseInt(canvasWidthInput.value) : 1920;
    const height = canvasHeightInput ? parseInt(canvasHeightInput.value) : 1080;
    
    return { width, height };
  }

  private initializeManagers(): void {
    if (!this.stage || !this.layer) {
      throw new Error('Canvas not initialized');
    }

    // Initialize managers
    this.viewportManager = new ViewportManager();
    
    // Set initial canvas dimensions in viewport manager
    const { width, height } = this.getCanvasSize();
    this.viewportManager.setCanvasDimensions(width, height);
    
    this.gridManager = new GridManager(this.stage, this.layer);
    this.elementManager = new ElementManager(this.layer, this.stage);
    
    // Provide grid manager to both tool manager and element manager
    this.elementManager.setGridManager(this.gridManager);
    
    this.toolManager = new ToolManager(this.stage, this.layer, this.elementManager);
    
    // Provide grid manager to tool manager for snapping
    this.toolManager.setGridManager(this.gridManager);
    
    this.propertiesPanel = new PropertiesPanel(this.elementManager, this.viewportManager);
    this.cssExporter = new CSSExporter(this.elementManager, this.viewportManager);
    this.eventManager = new EventManager(
      this.toolManager,
      this.gridManager,
      this.propertiesPanel,
      this.cssExporter,
      this.elementManager,
      this // Pass the app instance for viewport operations
    );

    // Suppress unused variable warning for eventManager
    void this.eventManager;

    // Draw initial grid
    this.gridManager.drawGrid();
    
    // Update canvas info and preset selection
    this.updateCanvasInfo(width, height);
    this.updatePresetSelection(width, height);
    this.updateOrientationIcon(width, height);
  }

  private setupEventListeners(): void {
    // Window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Grid size changes
    const gridSizeSlider = document.getElementById('grid-size') as HTMLInputElement;
    if (gridSizeSlider) {
      gridSizeSlider.addEventListener('input', (e) => {
        const size = parseInt((e.target as HTMLInputElement).value);
        this.gridManager?.updateGridSize(size);
        this.updateGridInfo(size);
      });
    }

    // Snap to grid toggle
    const snapToGrid = document.getElementById('snap-to-grid') as HTMLInputElement;
    if (snapToGrid) {
      snapToGrid.addEventListener('change', (e) => {
        const enabled = (e.target as HTMLInputElement).checked;
        this.toolManager?.setSnapToGrid(enabled);
        this.elementManager?.setSnapToGrid(enabled);
      });
    }

    // Canvas size changes
    const canvasWidthInput = document.getElementById('canvas-width') as HTMLInputElement;
    const canvasHeightInput = document.getElementById('canvas-height') as HTMLInputElement;
    
    if (canvasWidthInput && canvasHeightInput) {
      let lastKnownWidth = parseInt(canvasWidthInput.value);
      let lastKnownHeight = parseInt(canvasHeightInput.value);
      
      const updateCanvasSize = (shouldScaleElements = true) => {
        const width = parseInt(canvasWidthInput.value);
        const height = parseInt(canvasHeightInput.value);
        
        if (shouldScaleElements && (width !== lastKnownWidth || height !== lastKnownHeight)) {
          // Calculate scale factors for element proportional scaling
          const scaleFactors = ViewportPresets.calculateScaleFactors(
            lastKnownWidth, 
            lastKnownHeight, 
            width, 
            height
          );
          
          // Scale all elements proportionally
          this.elementManager?.scaleAllElements(scaleFactors.scaleX, scaleFactors.scaleY);
        }
        
        lastKnownWidth = width;
        lastKnownHeight = height;
        
        this.updateCanvasSize(width, height);
        this.updatePresetSelection(width, height);
      };
      
      canvasWidthInput.addEventListener('input', () => updateCanvasSize(true));
      canvasHeightInput.addEventListener('input', () => updateCanvasSize(true));
    }

    // Viewport presets
    const viewportPresetsSelect = document.getElementById('viewport-presets') as HTMLSelectElement;
    if (viewportPresetsSelect) {
      viewportPresetsSelect.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        if (value && canvasWidthInput && canvasHeightInput) {
          const preset = ViewportPresets.getPresetByKey(value);
          if (preset) {
            const currentWidth = parseInt(canvasWidthInput.value);
            const currentHeight = parseInt(canvasHeightInput.value);
            
            // Calculate scale factors for element proportional scaling
            const scaleFactors = ViewportPresets.calculateScaleFactors(
              currentWidth, 
              currentHeight, 
              preset.width, 
              preset.height
            );
            
            // Scale all elements proportionally
            this.elementManager?.scaleAllElements(scaleFactors.scaleX, scaleFactors.scaleY);
            
            canvasWidthInput.value = preset.width.toString();
            canvasHeightInput.value = preset.height.toString();
            this.updateCanvasSize(preset.width, preset.height);
            
            // Show notification for preset change
            this.showPresetChangeNotification(preset.name, preset.width, preset.height);
          }
        }
      });
    }

    // Toggle orientation
    const toggleOrientationBtn = document.getElementById('toggle-orientation');
    if (toggleOrientationBtn && canvasWidthInput && canvasHeightInput) {
      toggleOrientationBtn.addEventListener('click', () => {
        const currentWidth = parseInt(canvasWidthInput.value);
        const currentHeight = parseInt(canvasHeightInput.value);
        
        const newDimensions = this.viewportPresets.toggleOrientation(currentWidth, currentHeight);
        
        // Calculate scale factors for element proportional scaling
        const scaleFactors = ViewportPresets.calculateScaleFactors(
          currentWidth, 
          currentHeight, 
          newDimensions.width, 
          newDimensions.height
        );
        
        // Scale all elements proportionally
        this.elementManager?.scaleAllElements(scaleFactors.scaleX, scaleFactors.scaleY);
        
        canvasWidthInput.value = newDimensions.width.toString();
        canvasHeightInput.value = newDimensions.height.toString();
        
        this.updateCanvasSize(newDimensions.width, newDimensions.height);
        this.updatePresetSelection(newDimensions.width, newDimensions.height);
        
        // Visual feedback
        this.showOrientationToggleNotification(newDimensions.width, newDimensions.height);
      });
    }

    // Reset viewport button
    const resetViewportBtn = document.getElementById('reset-viewport');
    if (resetViewportBtn) {
      resetViewportBtn.addEventListener('click', () => {
        const container = document.getElementById('canvas-wrapper');
        if (container) {
          const rect = container.getBoundingClientRect();
          // Set to available container size minus margins
          const width = Math.max(320, rect.width - 40);
          const height = Math.max(240, rect.height - 40);
          
          if (canvasWidthInput) canvasWidthInput.value = width.toString();
          if (canvasHeightInput) canvasHeightInput.value = height.toString();
          
          this.updateCanvasSize(width, height);
        }
      });
    }

    // Clear canvas
    const clearBtn = document.getElementById('clear-canvas');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.elementManager?.clearAll();
        this.propertiesPanel?.clearProperties();
        this.cssExporter?.updateCSS();
      });
    }

    // Export CSS
    const exportBtn = document.getElementById('export-css');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.cssExporter?.exportToClipboard();
      });
    }
  }

  private handleResize(): void {
    // Window resize only updates viewport info, not canvas size
    this.updateViewportInfo();
  }

  private updateViewportInfo(): void {
    const viewportSizeElement = document.getElementById('viewport-size');
    if (viewportSizeElement) {
      viewportSizeElement.textContent = `${window.innerWidth}x${window.innerHeight}`;
    }
  }

  private updateGridInfo(size: number): void {
    const gridInfoElement = document.getElementById('grid-info');
    const gridSizeValueElement = document.getElementById('grid-size-value');
    
    if (gridInfoElement) {
      gridInfoElement.textContent = `${size}px`;
    }
    
    if (gridSizeValueElement) {
      gridSizeValueElement.textContent = `${size}px`;
    }
  }

  private updateCanvasSize(width: number, height: number): void {
    if (!this.stage || !this.viewportManager) return;

    const container = document.getElementById('konva-container');
    if (container) {
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    }

    this.stage.width(width);
    this.stage.height(height);
    
    // Update viewport manager with new canvas dimensions
    this.viewportManager.setCanvasDimensions(width, height);
    
    this.gridManager?.drawGrid();
    this.updateCanvasInfo(width, height);
    this.updateOrientationIcon(width, height);
    
    // Refresh properties panel if element is selected
    const selectedElement = this.elementManager?.getSelectedElement();
    if (selectedElement) {
      this.elementManager?.onElementUpdate?.(selectedElement);
    }
    
    // Update CSS output
    this.cssExporter?.updateCSS();
  }

  private updateCanvasInfo(width: number, height: number): void {
    const canvasInfoElement = document.getElementById('canvas-info');
    if (canvasInfoElement) {
      canvasInfoElement.textContent = `${width}x${height}`;
    }
  }

  private updateOrientationIcon(width: number, height: number): void {
    const toggleOrientationBtn = document.getElementById('toggle-orientation');
    if (toggleOrientationBtn) {
      const isLandscape = width > height;
      toggleOrientationBtn.classList.remove('portrait', 'landscape');
      toggleOrientationBtn.classList.add(isLandscape ? 'landscape' : 'portrait');
    }
  }

  private updatePresetSelection(width: number, height: number): void {
    const viewportPresetsSelect = document.getElementById('viewport-presets') as HTMLSelectElement;
    if (viewportPresetsSelect) {
      const key = `${width}x${height}`;
      const reverseKey = `${height}x${width}`;
      
      // Check if current dimensions match any preset
      let found = false;
      for (let i = 0; i < viewportPresetsSelect.options.length; i++) {
        const option = viewportPresetsSelect.options[i];
        if (option.value === key || option.value === reverseKey) {
          viewportPresetsSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      
      if (!found) {
        viewportPresetsSelect.selectedIndex = 0; // "Custom"
      }
    }
  }

  private showOrientationToggleNotification(width: number, height: number): void {
    const orientation = this.viewportPresets.getOrientationName(width, height);
    const presetName = this.viewportPresets.getPresetNameForDimensions(width, height);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #2196f3;
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      transition: opacity 0.3s ease;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <strong>${orientation}</strong><br>
      <small>${presetName}</small><br>
      <small style="opacity: 0.8;">Elements scaled proportionally</small>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2500);
  }

  private showPresetChangeNotification(presetName: string, width: number, height: number): void {
    const orientation = this.viewportPresets.getOrientationName(width, height);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #4caf50;
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      transition: opacity 0.3s ease;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <strong>${presetName}</strong><br>
      <small>${width}×${height} (${orientation})</small><br>
      <small style="opacity: 0.8;">Elements scaled proportionally</small>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2500);
  }

  // Public API for external access
  public getStage(): Konva.Stage | null {
    return this.stage;
  }

  public getLayer(): Konva.Layer | null {
    return this.layer;
  }

  public getElementManager(): ElementManager | null {
    return this.elementManager;
  }

  public getViewportManager(): ViewportManager | null {
    return this.viewportManager;
  }
}
