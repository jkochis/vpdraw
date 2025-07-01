import { ElementManager } from '../elements/ElementManager';
import type { DrawElement, ElementProperties } from '../elements/ElementManager';
import { ViewportManager } from '../viewport/ViewportManager';
import './components';

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
        // Use the new listener system instead of overwriting the callback
        this.elementManager.addSelectionChangeListener((element) => {
            this.updatePropertiesPanel(element);
        });

        this.elementManager.addElementUpdateListener((element) => {
            this.updatePropertiesPanel(element);
        });
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
            <property-group title="Element: ${type.charAt(0).toUpperCase() + type.slice(1)}">
                <div style="font-size: 12px; opacity: 0.7; margin-bottom: 10px;">System ID: ${element.id}</div>
            </property-group>

            <property-group title="🏷️ Element Identity">
                <property-text-input 
                    id="customId-input"
                    label="Custom ID"
                    placeholder="e.g., main-header, user-card"
                    pattern="[a-zA-Z][a-zA-Z0-9_-]*"
                    title="ID should start with a letter and contain only letters, numbers, hyphens, and underscores"
                    help-text="Unique identifier for CSS/HTML"
                    value="${properties.customId || ''}"
                    show-generate="true">
                </property-text-input>
                
                <property-text-input 
                    id="className-input"
                    label="CSS Class"
                    placeholder="e.g., header, sidebar, card"
                    pattern="[a-zA-Z][a-zA-Z0-9_-]*"
                    title="Class name should start with a letter and contain only letters, numbers, hyphens, and underscores"
                    help-text="Reusable style class"
                    value="${properties.className || ''}"
                    show-generate="true">
                </property-text-input>
            </property-group>

            <property-group title="Position & Size">
                <property-number-input 
                    id="x-input"
                    label="X"
                    value="${Math.round(properties.x)}"
                    units="${this.viewportManager.formatViewportUnit(properties.x, 'width')}">
                </property-number-input>
                
                <property-number-input 
                    id="y-input"
                    label="Y"
                    value="${Math.round(properties.y)}"
                    units="${this.viewportManager.formatViewportUnit(properties.y, 'height')}">
                </property-number-input>
                
                <property-number-input 
                    id="width-input"
                    label="Width"
                    value="${Math.round(properties.width)}"
                    units="${this.viewportManager.formatViewportUnit(properties.width, 'width')}">
                </property-number-input>
                
                <property-number-input 
                    id="height-input"
                    label="Height"
                    value="${Math.round(properties.height)}"
                    units="${this.viewportManager.formatViewportUnit(properties.height, 'height')}">
                </property-number-input>
                
                <div style="margin-top: 0.5rem;">
                    <small style="opacity: 0.7;">💡 Grid snapping is ${(document.getElementById('snap-to-grid') as HTMLInputElement)?.checked ? 'enabled' : 'disabled'}</small>
                </div>
            </property-group>

            <property-group title="Appearance">
                ${type === 'rectangle' ? `
                    <property-color-input 
                        id="fill-input"
                        label="Fill"
                        value="${properties.fill || '#f0f0f0'}">
                    </property-color-input>
                ` : ''}
                
                <property-color-input 
                    id="stroke-input"
                    label="Border Color"
                    value="${properties.stroke || '#333333'}">
                </property-color-input>
                
                <property-number-input 
                    id="strokeWidth-input"
                    label="Border Width"
                    value="${properties.strokeWidth || 1}"
                    min="0"
                    max="10">
                </property-number-input>
            </property-group>
        `;

        this.attachPropertyEventListeners(element);
    }

    private attachPropertyEventListeners(element: DrawElement): void {
        // Map component IDs to property names
        const componentPropertyMap: Record<string, string> = {
            'customId-input': 'customId',
            'className-input': 'className',
            'x-input': 'x',
            'y-input': 'y',
            'width-input': 'width',
            'height-input': 'height',
            'fill-input': 'fill',
            'stroke-input': 'stroke',
            'strokeWidth-input': 'strokeWidth'
        };

        // Attach listeners to all property components
        Object.keys(componentPropertyMap).forEach(componentId => {
            const component = this.propertiesContainer.querySelector(`#${componentId}`);
            const propertyName = componentPropertyMap[componentId];
            
            if (component) {
                // Listen for input changes
                component.addEventListener('input-changed', (e: Event) => {
                    const customEvent = e as CustomEvent;
                    let value = customEvent.detail.value;

                    // Apply sanitization for text inputs
                    if (propertyName === 'className') {
                        value = this.sanitizeClassName(value);
                        (component as any).value = value;
                    } else if (propertyName === 'customId') {
                        value = this.sanitizeId(value);
                        (component as any).value = value;
                    }

                    // Update element properties
                    const updates: Partial<ElementProperties> = {};
                    (updates as any)[propertyName] = value;
                    this.elementManager.updateElementProperties(element.id, updates);

                    // Update units display for numeric inputs
                    if (['x', 'y', 'width', 'height'].includes(propertyName)) {
                        const dimension = propertyName === 'x' || propertyName === 'width' ? 'width' : 'height';
                        (component as any).units = this.viewportManager.formatViewportUnit(value, dimension);
                    }
                });

                // Listen for generate button clicks
                component.addEventListener('generate-clicked', () => {
                    let newValue = '';
                    if (propertyName === 'className') {
                        newValue = this.generateClassName(element);
                    } else if (propertyName === 'customId') {
                        newValue = this.generateId(element);
                    }

                    if (newValue) {
                        (component as any).value = newValue;
                        
                        // Trigger update
                        const updates: Partial<ElementProperties> = {};
                        (updates as any)[propertyName] = newValue;
                        this.elementManager.updateElementProperties(element.id, updates);
                    }
                });
            }
        });
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
