import Konva from 'konva';
import { ElementManager } from '../elements/ElementManager';
import type { DrawElement } from '../elements/ElementManager';
import { GridManager } from '../grid/GridManager';

export type ToolType = 'select' | 'rectangle' | 'text';

export class ToolManager {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private elementManager: ElementManager;
  private currentTool: ToolType = 'select';
  private isDrawing = false;
  private startPoint: { x: number; y: number } | null = null;
  private previewShape: Konva.Shape | null = null;
  private snapToGrid = true;
  private gridManager: GridManager | null = null;

  constructor(stage: Konva.Stage, layer: Konva.Layer, elementManager: ElementManager) {
    this.stage = stage;
    this.layer = layer;
    this.elementManager = elementManager;
    this.setupEventHandlers();
    this.setupToolButtons();
  }

  public setGridManager(gridManager: GridManager): void {
    this.gridManager = gridManager;
  }

  private setupEventHandlers(): void {
    // Mouse down - start drawing
    this.stage.on('mousedown', (e) => {
      if (e.target !== this.stage) return; // Only handle clicks on empty canvas
      
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const adjustedPos = this.snapToGrid ? 
        this.gridManager?.snapPointToGrid(pos) || pos : pos;

      if (this.currentTool === 'select') {
        this.elementManager.selectElement(null);
      } else if (this.currentTool === 'rectangle' || this.currentTool === 'text') {
        this.startDrawing(adjustedPos);
      }
    });

    // Mouse move - update preview
    this.stage.on('mousemove', () => {
      if (!this.isDrawing || !this.startPoint) return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const adjustedPos = this.snapToGrid ? 
        this.gridManager?.snapPointToGrid(pos) || pos : pos;

      this.updatePreview(adjustedPos);
    });

    // Mouse up - finish drawing
    this.stage.on('mouseup', () => {
      if (!this.isDrawing) return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const adjustedPos = this.snapToGrid ? 
        this.gridManager?.snapPointToGrid(pos) || pos : pos;

      this.finishDrawing(adjustedPos);
    });

    // Click on empty area to deselect
    this.stage.on('click', (e) => {
      if (e.target === this.stage && this.currentTool === 'select') {
        this.elementManager.selectElement(null);
      }
    });
  }

  private setupToolButtons(): void {
    const tools = ['select', 'rectangle', 'text'] as const;
    
    tools.forEach(tool => {
      const button = document.getElementById(`${tool}-tool`);
      if (button) {
        button.addEventListener('click', () => {
          this.setTool(tool);
        });
      }
    });
  }

  private startDrawing(pos: { x: number; y: number }): void {
    this.isDrawing = true;
    this.startPoint = pos;
    
    if (this.currentTool === 'rectangle') {
      this.previewShape = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: 'rgba(100, 108, 255, 0.3)',
        stroke: '#646cff',
        strokeWidth: 2,
        dash: [5, 5],
      });
    } else if (this.currentTool === 'text') {
      this.previewShape = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: 'rgba(100, 108, 255, 0.1)',
        stroke: '#646cff',
        strokeWidth: 1,
        dash: [3, 3],
      });
    }

    if (this.previewShape) {
      this.layer.add(this.previewShape);
    }
  }

  private updatePreview(pos: { x: number; y: number }): void {
    if (!this.previewShape || !this.startPoint) return;

    const width = Math.abs(pos.x - this.startPoint.x);
    const height = Math.abs(pos.y - this.startPoint.y);
    const x = Math.min(pos.x, this.startPoint.x);
    const y = Math.min(pos.y, this.startPoint.y);

    this.previewShape.x(x);
    this.previewShape.y(y);
    this.previewShape.width(width);
    this.previewShape.height(height);
    
    this.layer.batchDraw();
  }

  private finishDrawing(pos: { x: number; y: number }): void {
    if (!this.startPoint) return;

    let width = Math.abs(pos.x - this.startPoint.x);
    let height = Math.abs(pos.y - this.startPoint.y);
    let x = Math.min(pos.x, this.startPoint.x);
    let y = Math.min(pos.y, this.startPoint.y);

    // Apply grid snapping to dimensions if enabled
    if (this.snapToGrid && this.gridManager) {
      x = this.gridManager.snapToGrid(x);
      y = this.gridManager.snapToGrid(y);
      width = this.gridManager.snapToGrid(width);
      height = this.gridManager.snapToGrid(height);
      
      // Ensure minimum size after snapping
      const gridSize = this.gridManager.getGridSize();
      width = Math.max(width, gridSize);
      height = Math.max(height, gridSize);
    }

    // Only create element if it has meaningful dimensions
    if (width > 5 && height > 5) {
      let element: DrawElement;
      
      if (this.currentTool === 'rectangle') {
        element = this.elementManager.createElement('rectangle', {
          x, y, width, height,
          fill: '#f0f0f0',
          stroke: '#333',
          strokeWidth: 1,
        });
      } else if (this.currentTool === 'text') {
        element = this.elementManager.createElement('text', {
          x, y,
          text: 'Text Element',
          fontSize: 16,
          fontFamily: 'Arial',
        });
      } else {
        return;
      }

      // Select the newly created element
      this.elementManager.selectElement(element);
    }

    // Clean up
    if (this.previewShape) {
      this.previewShape.destroy();
      this.previewShape = null;
    }
    
    this.isDrawing = false;
    this.startPoint = null;
    this.layer.batchDraw();
  }

  public setTool(tool: ToolType): void {
    // Clean up any ongoing drawing
    if (this.isDrawing && this.previewShape) {
      this.previewShape.destroy();
      this.previewShape = null;
      this.isDrawing = false;
      this.startPoint = null;
    }

    this.currentTool = tool;
    this.updateToolButtons();
    
    // Change cursor based on tool
    const container = this.stage.container();
    if (tool === 'select') {
      container.style.cursor = 'default';
    } else {
      container.style.cursor = 'crosshair';
    }
  }

  private updateToolButtons(): void {
    const tools = ['select', 'rectangle', 'text'] as const;
    
    tools.forEach(tool => {
      const button = document.getElementById(`${tool}-tool`);
      if (button) {
        if (tool === this.currentTool) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      }
    });
  }

  public setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
  }

  public getCurrentTool(): ToolType {
    return this.currentTool;
  }
}
