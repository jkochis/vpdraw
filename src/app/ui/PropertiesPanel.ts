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
    
    // Set initial state
    this.showEmptyState();
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
        <h4>Element: ${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 10px;">System ID: ${element.id}</div>
      </div>

      <div class="property-group">
        <h4>🏷️ Element Identity</h4>
        
        <div class="property-row">
          <label>Custom ID:</label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <input type="text" id="prop-customId" value="${properties.customId || ''}" 
                   placeholder="e.g., main-header, user-card" 
                   pattern="[a-zA-Z][a-zA-Z0-9_-]*" 
                   title="ID should start with a letter and contain only letters, numbers, hyphens, and underscores"
                   style="flex: 1;" />
            <button type="button" id="generate-customId" title="Generate ID" 
                    style="padding: 4px 8px; font-size: 12px; background: #646cff; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Generate
            </button>
          </div>
          <small style="opacity: 0.7; font-size: 12px;">Unique identifier for CSS/HTML</small>
        </div>
        
        <div class="property-row">
          <label>CSS Class:</label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <input type="text" id="prop-className" value="${properties.className || ''}" 
                   placeholder="e.g., header, sidebar, card" 
                   pattern="[a-zA-Z][a-zA-Z0-9_-]*" 
                   title="Class name should start with a letter and contain only letters, numbers, hyphens, and underscores"
                   style="flex: 1;" />
            <button type="button" id="generate-className" title="Generate class name" 
                    style="padding: 4px 8px; font-size: 12px; background: #646cff; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Generate
            </button>
          </div>
          <small style="opacity: 0.7; font-size: 12px;">Reusable style class</small>
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

  private attachPropertyEventListeners(element: DrawElement): void {
    const inputs = this.propertiesContainer.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      const propertyName = input.id.replace('prop-', '');
      
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        let value: any = target.value;
        
        // Convert numeric properties
        if (['x', 'y', 'width', 'height', 'strokeWidth'].includes(propertyName)) {
          value = parseFloat(value) || 0;
        }
        
        // Validate and sanitize class names and IDs
        if (propertyName === 'className') {
          value = this.sanitizeClassName(value);
          // Update the input with the sanitized value
          if (target.value !== value) {
            target.value = value;
          }
        } else if (propertyName === 'customId') {
          value = this.sanitizeId(value);
          // Update the input with the sanitized value
          if (target.value !== value) {
            target.value = value;
          }
        }
        
        const updates: Partial<ElementProperties> = {};
        updates[propertyName as keyof ElementProperties] = value;
        
        this.elementManager.updateElementProperties(element.id, updates);
      });
    });

    // Add event listener for the generate class name button
    const generateBtn = this.propertiesContainer.querySelector('#generate-className') as HTMLButtonElement;
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const newClassName = this.generateClassName(element);
        const classNameInput = this.propertiesContainer.querySelector('#prop-className') as HTMLInputElement;
        if (classNameInput) {
          classNameInput.value = newClassName;
          // Trigger the input event to update the element
          const event = new Event('input', { bubbles: true });
          classNameInput.dispatchEvent(event);
        }
      });
    }

    // Add event listener for the generate ID button
    const generateIdBtn = this.propertiesContainer.querySelector('#generate-customId') as HTMLButtonElement;
    if (generateIdBtn) {
      generateIdBtn.addEventListener('click', () => {
        const newId = this.generateId(element);
        const idInput = this.propertiesContainer.querySelector('#prop-customId') as HTMLInputElement;
        if (idInput) {
          idInput.value = newId;
          // Trigger the input event to update the element
          const event = new Event('input', { bubbles: true });
          idInput.dispatchEvent(event);
        }
      });
    }
  }

  private sanitizeClassName(className: string): string {
    if (!className) return '';
    
    // Remove invalid characters and ensure it starts with a letter
    let sanitized = className
      .replace(/[^a-zA-Z0-9_-]/g, '') // Remove invalid characters
      .replace(/^[^a-zA-Z]*/, ''); // Remove leading non-letters
    
    // If empty after sanitization, return empty string
    if (!sanitized) return '';
    
    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'el-' + sanitized;
    }
    
    return sanitized;
  }

  private sanitizeId(id: string): string {
    if (!id) return '';
    
    // IDs follow the same rules as class names in CSS
    let sanitized = id
      .replace(/[^a-zA-Z0-9_-]/g, '') // Remove invalid characters
      .replace(/^[^a-zA-Z]*/, ''); // Remove leading non-letters
    
    // If empty after sanitization, return empty string
    if (!sanitized) return '';
    
    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'id-' + sanitized;
    }
    
    return sanitized;
  }

  private generateClassName(element: DrawElement): string {
    const { type } = element;
    
    // Generate semantic class names based on element position and size
    const suggestions = this.getClassNameSuggestions(element);
    
    // Use the first suggestion, or fall back to a numbered class
    return suggestions[0] || `${type}-${Date.now().toString(36)}`;
  }

  private generateId(element: DrawElement): string {
    const { type } = element;
    
    // Generate unique IDs based on element position and size
    const suggestions = this.getIdSuggestions(element);
    
    // Use the first suggestion, or fall back to a numbered ID
    return suggestions[0] || `${type}-${Date.now().toString(36)}`;
  }

  private getClassNameSuggestions(element: DrawElement): string[] {
    const { properties, type } = element;
    const suggestions: string[] = [];
    
    // Get viewport manager for calculations
    const canvasDimensions = this.viewportManager.getCanvasDimensions();
    const canvasWidth = canvasDimensions.width;
    const canvasHeight = canvasDimensions.height;
    
    // Position-based suggestions
    const leftPercentage = (properties.x / canvasWidth) * 100;
    const topPercentage = (properties.y / canvasHeight) * 100;
    const widthPercentage = (properties.width / canvasWidth) * 100;
    const heightPercentage = (properties.height / canvasHeight) * 100;
    
    // Size-based suggestions
    if (widthPercentage > 80 && heightPercentage < 20) {
      if (topPercentage < 20) suggestions.push('header');
      else if (topPercentage > 80) suggestions.push('footer');
      else suggestions.push('banner');
    } else if (heightPercentage > 60 && widthPercentage < 30) {
      if (leftPercentage < 20) suggestions.push('sidebar');
      else if (leftPercentage > 70) suggestions.push('aside');
      else suggestions.push('column');
    } else if (widthPercentage > 60 && heightPercentage > 40) {
      suggestions.push('main-content');
    } else if (widthPercentage < 40 && heightPercentage < 40) {
      suggestions.push('card');
    } else {
      suggestions.push('section');
    }
    
    // Position-based modifiers
    if (leftPercentage < 25) suggestions.push('left-' + type);
    else if (leftPercentage > 75) suggestions.push('right-' + type);
    else suggestions.push('center-' + type);
    
    if (topPercentage < 25) suggestions.push('top-' + type);
    else if (topPercentage > 75) suggestions.push('bottom-' + type);
    
    // Generic fallback
    suggestions.push(type + '-element');
    
    return suggestions;
  }

  private getIdSuggestions(element: DrawElement): string[] {
    const { properties, type } = element;
    const suggestions: string[] = [];
    
    // Get viewport manager for calculations
    const canvasDimensions = this.viewportManager.getCanvasDimensions();
    const canvasWidth = canvasDimensions.width;
    const canvasHeight = canvasDimensions.height;
    
    // Position-based suggestions for unique IDs
    const leftPercentage = (properties.x / canvasWidth) * 100;
    const topPercentage = (properties.y / canvasHeight) * 100;
    const widthPercentage = (properties.width / canvasWidth) * 100;
    const heightPercentage = (properties.height / canvasHeight) * 100;
    
    // Size-based unique ID suggestions
    if (widthPercentage > 80 && heightPercentage < 20) {
      if (topPercentage < 20) suggestions.push('main-header');
      else if (topPercentage > 80) suggestions.push('main-footer');
      else suggestions.push('main-banner');
    } else if (heightPercentage > 60 && widthPercentage < 30) {
      if (leftPercentage < 20) suggestions.push('left-sidebar');
      else if (leftPercentage > 70) suggestions.push('right-sidebar');
      else suggestions.push('main-column');
    } else if (widthPercentage > 60 && heightPercentage > 40) {
      suggestions.push('main-content');
    } else if (widthPercentage < 40 && heightPercentage < 40) {
      suggestions.push('content-card');
    } else {
      suggestions.push('content-section');
    }
    
    // Position-based unique ID modifiers
    const timestamp = Date.now().toString(36).slice(-4); // Short timestamp for uniqueness
    if (leftPercentage < 25) suggestions.push(`left-${type}-${timestamp}`);
    else if (leftPercentage > 75) suggestions.push(`right-${type}-${timestamp}`);
    else suggestions.push(`center-${type}-${timestamp}`);
    
    if (topPercentage < 25) suggestions.push(`top-${type}-${timestamp}`);
    else if (topPercentage > 75) suggestions.push(`bottom-${type}-${timestamp}`);
    
    // Generic fallback with timestamp for uniqueness
    suggestions.push(`${type}-${timestamp}`);
    
    return suggestions;
  }

  public clearProperties(): void {
    this.showEmptyState();
  }
}
