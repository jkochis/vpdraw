import Konva from 'konva';

export interface DrawElement {
  id: string;
  type: 'rectangle';
  shape: Konva.Shape;
  properties: ElementProperties;
}

export interface ElementProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  className?: string;
  customId?: string;
}

export class ElementManager {
  private layer: Konva.Layer;
  private elements: Map<string, DrawElement> = new Map();
  private selectedElements: Set<DrawElement> = new Set();
  private transformer: Konva.Transformer;
  private elementCounter = 0;
  private snapToGrid = true;
  private gridManager: any = null; // Will be set by the app
  private selectionRect: Konva.Rect | null = null;
  private selectionStartPos: { x: number; y: number } | null = null;
  private isSelecting = false;

  constructor(layer: Konva.Layer, stage: Konva.Stage) {
    this.layer = layer;
    this.transformer = new Konva.Transformer({
      resizeEnabled: true,
      rotateEnabled: false,
      borderStroke: '#646cff',
      borderStrokeWidth: 2,
      anchorStroke: '#646cff',
      anchorStrokeWidth: 2,
      anchorSize: 8,
    });
    this.layer.add(this.transformer);

    // Add stage event listeners for selection rectangle
    this.setupStageEvents(stage);
    
    // Add transformer event listeners for group operations
    this.setupTransformerEvents();
  }

  public setGridManager(gridManager: any): void {
    this.gridManager = gridManager;
  }

  private setupTransformerEvents(): void {
    // Handle transformer drag operations for updating element properties
    this.transformer.on('dragmove', () => {
      this.selectedElements.forEach((element) => {
        const shape = element.shape;
        let x = shape.x();
        let y = shape.y();
        
        // Apply grid snapping if enabled
        if (this.snapToGrid && this.gridManager) {
          x = this.gridManager.snapToGrid(x);
          y = this.gridManager.snapToGrid(y);
          shape.x(x);
          shape.y(y);
        }
        
        // Update element properties
        element.properties.x = x;
        element.properties.y = y;
      });
      
      // Notify about updates for the first selected element
      const firstElement = Array.from(this.selectedElements)[0];
      if (firstElement) {
        this.onElementUpdate?.(firstElement);
      }
    });
  }

  private setupStageEvents(stage: Konva.Stage): void {
    // Handle selection rectangle drawing
    stage.on('mousedown touchstart', (e) => {
      // Only handle if clicking on empty space (not on an element)
      if (e.target === stage) {
        this.startSelectionRect(stage.getPointerPosition()!);
      }
    });

    stage.on('mousemove touchmove', () => {
      if (this.isSelecting) {
        this.updateSelectionRect(stage.getPointerPosition()!);
      }
    });

    stage.on('mouseup touchend', () => {
      if (this.isSelecting) {
        this.finishSelectionRect();
      }
    });

    // Clear selection when clicking empty space
    stage.on('click tap', (e) => {
      if (e.target === stage) {
        // Check if Ctrl/Cmd is held for multi-selection
        const evt = e.evt as MouseEvent;
        if (!evt.ctrlKey && !evt.metaKey) {
          this.clearSelection();
        }
      }
    });
  }

  public setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
  }

  public createElement(type: 'rectangle', properties: Partial<ElementProperties>): DrawElement {
    const id = `element-${++this.elementCounter}`;
    
    let shape: Konva.Shape;
    const defaultProps: ElementProperties = {
      x: properties.x || 50,
      y: properties.y || 50,
      width: properties.width || 100,
      height: properties.height || 60,
      fill: properties.fill || '#f0f0f0',
      stroke: properties.stroke || '#333',
      strokeWidth: properties.strokeWidth || 1,
      className: properties.className || `${type}-${this.elementCounter}`,
    };

    if (type === 'rectangle') {
      shape = new Konva.Rect({
        x: defaultProps.x,
        y: defaultProps.y,
        width: defaultProps.width,
        height: defaultProps.height,
        fill: defaultProps.fill,
        stroke: defaultProps.stroke,
        strokeWidth: defaultProps.strokeWidth,
        draggable: true,
      });
    } else {
      throw new Error(`Unsupported element type: ${type}`);
    }

    const element: DrawElement = {
      id,
      type,
      shape,
      properties: defaultProps,
    };

    // Add event listeners
    this.setupElementEvents(element);
    
    this.elements.set(id, element);
    this.layer.add(shape);
    this.layer.batchDraw();

    return element;
  }

  private setupElementEvents(element: DrawElement): void {
    const { shape } = element;

    // Selection on click
    shape.on('click', (e) => {
      const evt = e.evt as MouseEvent;
      // Check if Ctrl/Cmd is held for multi-selection
      if (evt.ctrlKey || evt.metaKey) {
        this.toggleElementSelection(element);
      } else {
        this.selectElement(element);
      }
    });

    // Update properties on drag
    shape.on('dragmove', () => {
      let x = shape.x();
      let y = shape.y();
      
      // Apply grid snapping if enabled
      if (this.snapToGrid && this.gridManager) {
        x = this.gridManager.snapToGrid(x);
        y = this.gridManager.snapToGrid(y);
        shape.x(x);
        shape.y(y);
      }
      
      // Update properties
      element.properties.x = x;
      element.properties.y = y;
      this.onElementUpdate?.(element);
    });

    // Update properties on transform
    shape.on('transform', () => {
      const scaleX = shape.scaleX();
      const scaleY = shape.scaleY();
      
      let width = shape.width() * scaleX;
      let height = shape.height() * scaleY;
      let x = shape.x();
      let y = shape.y();
      
      // Apply grid snapping if enabled
      if (this.snapToGrid && this.gridManager) {
        x = this.gridManager.snapToGrid(x);
        y = this.gridManager.snapToGrid(y);
        width = this.gridManager.snapToGrid(width);
        height = this.gridManager.snapToGrid(height);
        
        // Ensure minimum size
        const gridSize = this.gridManager.getGridSize();
        width = Math.max(width, gridSize);
        height = Math.max(height, gridSize);
      }
      
      element.properties.width = width;
      element.properties.height = height;
      element.properties.x = x;
      element.properties.y = y;
      
      // Reset scale to 1 and apply to width/height
      shape.scaleX(1);
      shape.scaleY(1);
      shape.width(width);
      shape.height(height);
      shape.x(x);
      shape.y(y);
      
      this.onElementUpdate?.(element);
    });
  }

  private startSelectionRect(pos: { x: number; y: number }): void {
    this.isSelecting = true;
    this.selectionStartPos = pos;
    
    this.selectionRect = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: 'rgba(100, 108, 255, 0.1)',
      stroke: '#646cff',
      strokeWidth: 1,
      dash: [3, 3],
    });
    
    this.layer.add(this.selectionRect);
    this.layer.batchDraw();
  }

  private updateSelectionRect(pos: { x: number; y: number }): void {
    if (!this.selectionRect || !this.selectionStartPos) return;
    
    const x = Math.min(this.selectionStartPos.x, pos.x);
    const y = Math.min(this.selectionStartPos.y, pos.y);
    const width = Math.abs(pos.x - this.selectionStartPos.x);
    const height = Math.abs(pos.y - this.selectionStartPos.y);
    
    this.selectionRect.x(x);
    this.selectionRect.y(y);
    this.selectionRect.width(width);
    this.selectionRect.height(height);
    
    this.layer.batchDraw();
  }

  private finishSelectionRect(): void {
    if (!this.selectionRect || !this.selectionStartPos) return;
    
    const x = this.selectionRect.x();
    const y = this.selectionRect.y();
    const width = this.selectionRect.width();
    const height = this.selectionRect.height();
    
    // Find elements within selection rectangle
    const elementsInRect: DrawElement[] = [];
    this.elements.forEach((element) => {
      const shape = element.shape;
      const shapeBox = shape.getClientRect();
      
      // Check if element intersects with selection rectangle
      if (shapeBox.x < x + width &&
          shapeBox.x + shapeBox.width > x &&
          shapeBox.y < y + height &&
          shapeBox.y + shapeBox.height > y) {
        elementsInRect.push(element);
      }
    });
    
    // Select found elements
    if (elementsInRect.length > 0) {
      this.selectMultipleElements(elementsInRect);
    } else {
      this.clearSelection();
    }
    
    // Clean up selection rectangle
    this.selectionRect.destroy();
    this.selectionRect = null;
    this.selectionStartPos = null;
    this.isSelecting = false;
    this.layer.batchDraw();
  }

  private clearSelection(): void {
    // Reset all selected elements to normal appearance
    this.selectedElements.forEach((element) => {
      element.shape.stroke(element.properties.stroke || '#333');
      element.shape.strokeWidth(element.properties.strokeWidth || 1);
    });
    
    this.selectedElements.clear();
    this.transformer.nodes([]);
    this.layer.batchDraw();
    this.onSelectionChange?.(null);
  }

  private toggleElementSelection(element: DrawElement): void {
    if (this.selectedElements.has(element)) {
      // Remove from selection
      this.selectedElements.delete(element);
      element.shape.stroke(element.properties.stroke || '#333');
      element.shape.strokeWidth(element.properties.strokeWidth || 1);
    } else {
      // Add to selection
      this.selectedElements.add(element);
      element.shape.stroke('#646cff');
      element.shape.strokeWidth(2);
    }
    
    this.updateTransformer();
    this.layer.batchDraw();
    
    // Show notification for multi-selection
    if (this.selectedElements.size > 1) {
      this.showMultiSelectionNotification(this.selectedElements.size);
    }
    
    // Notify about selection change
    const selectedArray = Array.from(this.selectedElements);
    this.onSelectionChange?.(selectedArray.length === 1 ? selectedArray[0] : null);
  }

  public selectMultipleElements(elements: DrawElement[]): void {
    this.clearSelection();
    
    elements.forEach((element) => {
      this.selectedElements.add(element);
      element.shape.stroke('#646cff');
      element.shape.strokeWidth(2);
    });
    
    this.updateTransformer();
    this.layer.batchDraw();
    
    // Show notification for multi-selection
    if (elements.length > 1) {
      this.showMultiSelectionNotification(elements.length);
    }
    
    // Notify about selection change
    this.onSelectionChange?.(elements.length === 1 ? elements[0] : null);
  }

  private showMultiSelectionNotification(count: number): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 8px 16px;
      background: #4caf50;
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = `${count} elements selected`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 1500);
  }

  private updateTransformer(): void {
    const selectedShapes = Array.from(this.selectedElements).map(el => el.shape);
    this.transformer.nodes(selectedShapes);
    this.transformer.forceUpdate();
    
    // Ensure all selected elements remain draggable
    selectedShapes.forEach(shape => {
      shape.draggable(true);
    });
  }

  public selectElement(element: DrawElement | null): void {
    // Clear previous selection
    this.clearSelection();
    
    if (element) {
      this.selectedElements.add(element);
      element.shape.stroke('#646cff');
      element.shape.strokeWidth(2);
      this.updateTransformer();
    }

    this.layer.batchDraw();
    this.onSelectionChange?.(element);
  }

  public updateElementProperties(elementId: string, properties: Partial<ElementProperties>): void {
    const element = this.elements.get(elementId);
    if (!element) return;

    // Apply grid snapping to position and size properties if enabled
    if (this.snapToGrid && this.gridManager) {
      if (properties.x !== undefined) {
        properties.x = this.gridManager.snapToGrid(properties.x);
      }
      if (properties.y !== undefined) {
        properties.y = this.gridManager.snapToGrid(properties.y);
      }
      if (properties.width !== undefined) {
        const snappedWidth = this.gridManager.snapToGrid(properties.width);
        // Ensure minimum size
        const gridSize = this.gridManager.getGridSize();
        properties.width = Math.max(snappedWidth, gridSize);
      }
      if (properties.height !== undefined) {
        const snappedHeight = this.gridManager.snapToGrid(properties.height);
        // Ensure minimum size
        const gridSize = this.gridManager.getGridSize();
        properties.height = Math.max(snappedHeight, gridSize);
      }
    }

    // Update element properties
    Object.assign(element.properties, properties);

    // Update shape
    const { shape } = element;
    if (properties.x !== undefined) shape.x(properties.x);
    if (properties.y !== undefined) shape.y(properties.y);
    if (properties.width !== undefined) shape.width(properties.width);
    if (properties.height !== undefined) shape.height(properties.height);
    if (properties.fill !== undefined) shape.fill(properties.fill);
    if (properties.stroke !== undefined) shape.stroke(properties.stroke);
    if (properties.strokeWidth !== undefined) shape.strokeWidth(properties.strokeWidth);

    this.layer.batchDraw();
    this.onElementUpdate?.(element);
  }

  public deleteElement(elementId: string): void {
    const element = this.elements.get(elementId);
    if (!element) return;

    if (this.selectedElements.has(element)) {
      this.selectedElements.delete(element);
      this.updateTransformer();
    }

    element.shape.destroy();
    this.elements.delete(elementId);
    this.layer.batchDraw();
  }

  public clearAll(): void {
    this.elements.forEach((element) => {
      element.shape.destroy();
    });
    this.elements.clear();
    this.selectedElements.clear();
    this.transformer.nodes([]);
    this.layer.batchDraw();
  }

  public getSelectedElement(): DrawElement | null {
    // Return first selected element for backward compatibility
    const selectedArray = Array.from(this.selectedElements);
    return selectedArray.length > 0 ? selectedArray[0] : null;
  }

  public getSelectedElements(): DrawElement[] {
    return Array.from(this.selectedElements);
  }

  public getAllElements(): DrawElement[] {
    return Array.from(this.elements.values());
  }

  public getElementById(id: string): DrawElement | undefined {
    return this.elements.get(id);
  }

  public scaleAllElements(scaleX: number, scaleY: number): void {
    this.elements.forEach((element) => {
      const props = element.properties;
      
      // Scale position and dimensions
      const scaledProps: Partial<ElementProperties> = {
        x: props.x * scaleX,
        y: props.y * scaleY,
        width: props.width * scaleX,
        height: props.height * scaleY,
      };

      // Temporarily disable snap to grid to avoid snapping during scaling
      const wasSnapping = this.snapToGrid;
      this.snapToGrid = false;
      
      this.updateElementProperties(element.id, scaledProps);
      
      // Restore snap to grid setting
      this.snapToGrid = wasSnapping;
    });

    // Update transformer if elements are selected
    if (this.selectedElements.size > 0) {
      this.updateTransformer();
    }

    this.layer.batchDraw();
  }

  // Event callbacks
  public onSelectionChange?: (element: DrawElement | null) => void;
  public onElementUpdate?: (element: DrawElement) => void;
}
