import { ElementManager } from '../elements/ElementManager';
import type { DrawElement, ElementProperties } from '../elements/ElementManager';
import { ViewportManager } from '../viewport/ViewportManager';

export class PropertiesPanel {
  private elementManager: ElementManager;
  private viewportManager: ViewportManager;
  private propertiesContainer: HTMLElement;

  constructor(elementManager: ElementManager, viewportManager: ViewportManager) {
    this.elementManager = elementManager;
    this.viewportManager = viewportManager;
    
    const container = document.getElementById('element-properties');
    if (!container) {
      throw new Error('Properties container not found');
    }
    this.propertiesContainer = container;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.elementManager.onSelectionChange = (element) => {
      this.updatePropertiesPanel(element);
    };

    this.elementManager.onElementUpdate = (element) => {
      this.updatePropertiesPanel(element);
    };
  }

  private updatePropertiesPanel(element: DrawElement | null): void {
    if (!element) {
      this.showEmptyState();
      return;
    }

    this.showElementProperties(element);
  }

  private showEmptyState(): void {
    this.propertiesContainer.innerHTML = '<p>Select an element to edit properties</p>';
  }

  private showElementProperties(element: DrawElement): void {
    const { properties, type } = element;
    
    this.propertiesContainer.innerHTML = `
      <div class="property-group">
        <h4>Element: ${type.charAt(0).toUpperCase() + type.slice(1)} (${element.id})</h4>
        
        <div class="property-row">
          <label>Class Name:</label>
          <input type="text" id="prop-className" value="${properties.className || ''}" />
        </div>
      </div>

      <div class="property-group">
        <h4>Position & Size</h4>
        
        <div class="property-row">
          <label>X:</label>
          <input type="number" id="prop-x" value="${Math.round(properties.x)}" />
          <span class="units-display">${this.viewportManager.formatViewportUnit(properties.x, 'width')}</span>
        </div>
        
        <div class="property-row">
          <label>Y:</label>
          <input type="number" id="prop-y" value="${Math.round(properties.y)}" />
          <span class="units-display">${this.viewportManager.formatViewportUnit(properties.y, 'height')}</span>
        </div>
        
        <div class="property-row">
          <label>Width:</label>
          <input type="number" id="prop-width" value="${Math.round(properties.width)}" />
          <span class="units-display">${this.viewportManager.formatViewportUnit(properties.width, 'width')}</span>
        </div>
        
        <div class="property-row">
          <label>Height:</label>
          <input type="number" id="prop-height" value="${Math.round(properties.height)}" />
          <span class="units-display">${this.viewportManager.formatViewportUnit(properties.height, 'height')}</span>
        </div>
        
        <div class="snap-info">
          <small>💡 Grid snapping is ${(document.getElementById('snap-to-grid') as HTMLInputElement)?.checked ? 'enabled' : 'disabled'}</small>
        </div>
      </div>

      ${type === 'text' ? this.getTextProperties(properties) : ''}
      
      <div class="property-group">
        <h4>Appearance</h4>
        
        ${type === 'rectangle' ? `
          <div class="property-row">
            <label>Fill:</label>
            <input type="color" id="prop-fill" value="${properties.fill || '#f0f0f0'}" />
          </div>
        ` : ''}
        
        <div class="property-row">
          <label>Border Color:</label>
          <input type="color" id="prop-stroke" value="${properties.stroke || '#333333'}" />
        </div>
        
        <div class="property-row">
          <label>Border Width:</label>
          <input type="number" id="prop-strokeWidth" value="${properties.strokeWidth || 1}" min="0" max="10" />
        </div>
      </div>
    `;

    this.attachPropertyEventListeners(element);
  }

  private getTextProperties(properties: ElementProperties): string {
    return `
      <div class="property-group">
        <h4>Text Properties</h4>
        
        <div class="property-row">
          <label>Text:</label>
          <input type="text" id="prop-text" value="${properties.text || ''}" />
        </div>
        
        <div class="property-row">
          <label>Font Size:</label>
          <input type="number" id="prop-fontSize" value="${properties.fontSize || 16}" min="8" max="72" />
        </div>
        
        <div class="property-row">
          <label>Font Family:</label>
          <select id="prop-fontFamily">
            <option value="Arial" ${properties.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
            <option value="Helvetica" ${properties.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
            <option value="Georgia" ${properties.fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
            <option value="Times New Roman" ${properties.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
            <option value="Courier New" ${properties.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
          </select>
        </div>
      </div>
    `;
  }

  private attachPropertyEventListeners(element: DrawElement): void {
    const inputs = this.propertiesContainer.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      const propertyName = input.id.replace('prop-', '');
      
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        let value: any = target.value;
        
        // Convert numeric properties
        if (['x', 'y', 'width', 'height', 'strokeWidth', 'fontSize'].includes(propertyName)) {
          value = parseFloat(value) || 0;
        }
        
        const updates: Partial<ElementProperties> = {};
        updates[propertyName as keyof ElementProperties] = value;
        
        this.elementManager.updateElementProperties(element.id, updates);
      });
    });
  }

  public clearProperties(): void {
    this.showEmptyState();
  }
}
