import { ElementManager } from '../elements/ElementManager';
import type { DrawElement, ElementProperties } from '../elements/ElementManager';
import { ViewportManager } from '../viewport/ViewportManager';
import './components';

export class PropertiesPanel {
    private elementManager: ElementManager;
    private viewportManager: ViewportManager;
    private propertiesContainer: HTMLElement;
    private currentElement: DrawElement | null = null;

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
            // Only update the values if it's the same element, don't regenerate the entire panel
            if (element && this.currentElement && element.id === this.currentElement.id) {
                this.updateComponentValues(element);
            } else {
                this.updatePropertiesPanel(element);
            }
        });
    }

    private updatePropertiesPanel(element: DrawElement | null): void {
        if (!element) {
            this.currentElement = null;
            this.showEmptyState();
            return;
        }

        this.currentElement = element;
        this.showElementProperties(element);
    }

    private showEmptyState(): void {
        this.propertiesContainer.innerHTML = '<p>Select an element to edit properties</p>';
    }

    private showElementProperties(element: DrawElement): void {
        const { properties, type } = element;

        // Clear the container
        this.propertiesContainer.innerHTML = '';

        // Create and add properties header
        // const header = document.createElement('properties-header');
        // this.propertiesContainer.appendChild(header);

        // Create identity group
        const identityGroup = document.createElement('property-group');
        identityGroup.setAttribute('title', '🏷️ Element Identity');
        
        const customIdInput = document.createElement('property-text-input');
        customIdInput.id = 'customId-input';
        customIdInput.setAttribute('label', 'Custom ID');
        customIdInput.setAttribute('placeholder', 'e.g., main-header, user-card');
        customIdInput.setAttribute('pattern', '[a-zA-Z][a-zA-Z0-9_-]*');
        customIdInput.setAttribute('title', 'ID should start with a letter and contain only letters, numbers, hyphens, and underscores');
        customIdInput.setAttribute('help-text', 'Unique identifier for CSS/HTML');
        customIdInput.setAttribute('value', properties.customId || '');
        customIdInput.setAttribute('show-generate', 'true');
        identityGroup.appendChild(customIdInput);
        
        const classNameInput = document.createElement('property-text-input');
        classNameInput.id = 'className-input';
        classNameInput.setAttribute('label', 'CSS Class');
        classNameInput.setAttribute('placeholder', 'e.g., header, sidebar, card');
        classNameInput.setAttribute('pattern', '[a-zA-Z][a-zA-Z0-9_-]*');
        classNameInput.setAttribute('title', 'Class name should start with a letter and contain only letters, numbers, hyphens, and underscores');
        classNameInput.setAttribute('help-text', 'Reusable style class');
        classNameInput.setAttribute('value', properties.className || '');
        classNameInput.setAttribute('show-generate', 'true');
        identityGroup.appendChild(classNameInput);
        
        this.propertiesContainer.appendChild(identityGroup);

        // Create position & size group
        const positionGroup = document.createElement('property-group');
        positionGroup.setAttribute('title', '📏 Position & Size');
        
        const xInput = document.createElement('property-number-input');
        xInput.id = 'x-input';
        xInput.setAttribute('label', 'X');
        xInput.setAttribute('value', Math.round(properties.x).toString());
        xInput.setAttribute('units', this.viewportManager.formatViewportUnit(properties.x, 'width'));
        positionGroup.appendChild(xInput);
        
        const yInput = document.createElement('property-number-input');
        yInput.id = 'y-input';
        yInput.setAttribute('label', 'Y');
        yInput.setAttribute('value', Math.round(properties.y).toString());
        yInput.setAttribute('units', this.viewportManager.formatViewportUnit(properties.y, 'height'));
        positionGroup.appendChild(yInput);
        
        const widthInput = document.createElement('property-number-input');
        widthInput.id = 'width-input';
        widthInput.setAttribute('label', 'Width');
        widthInput.setAttribute('value', Math.round(properties.width).toString());
        widthInput.setAttribute('units', this.viewportManager.formatViewportUnit(properties.width, 'width'));
        positionGroup.appendChild(widthInput);
        
        const heightInput = document.createElement('property-number-input');
        heightInput.id = 'height-input';
        heightInput.setAttribute('label', 'Height');
        heightInput.setAttribute('value', Math.round(properties.height).toString());
        heightInput.setAttribute('units', this.viewportManager.formatViewportUnit(properties.height, 'height'));
        positionGroup.appendChild(heightInput);
        
        const gridStatus = document.createElement('grid-status');
        positionGroup.appendChild(gridStatus);
        
        this.propertiesContainer.appendChild(positionGroup);

        // Create appearance group
        const appearanceGroup = document.createElement('property-group');
        appearanceGroup.setAttribute('title', '🎨 Appearance');
        
        // Add fill input for rectangles
        if (type === 'rectangle') {
            const fillInput = document.createElement('property-color-input');
            fillInput.id = 'fill-input';
            fillInput.setAttribute('label', 'Fill');
            fillInput.setAttribute('value', properties.fill || '#f0f0f0');
            appearanceGroup.appendChild(fillInput);
        }
        
        const strokeInput = document.createElement('property-color-input');
        strokeInput.id = 'stroke-input';
        strokeInput.setAttribute('label', 'Border Color');
        strokeInput.setAttribute('value', properties.stroke || '#333333');
        appearanceGroup.appendChild(strokeInput);
        
        const strokeWidthInput = document.createElement('property-number-input');
        strokeWidthInput.id = 'strokeWidth-input';
        strokeWidthInput.setAttribute('label', 'Border Width');
        strokeWidthInput.setAttribute('value', (properties.strokeWidth || 1).toString());
        strokeWidthInput.setAttribute('min', '0');
        strokeWidthInput.setAttribute('max', '10');
        appearanceGroup.appendChild(strokeWidthInput);
        
        this.propertiesContainer.appendChild(appearanceGroup);

        this.attachPropertyEventListeners(element);
        this.attachCollapseControls();
    }

    private updateComponentValues(element: DrawElement): void {
        const { properties } = element;
        
        // Map component IDs to property names - same as in attachPropertyEventListeners
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

        // Update each component's value
        Object.keys(componentPropertyMap).forEach(componentId => {
            // Skip the component that triggered the update to prevent overwriting user input
            if ((this as any)._updatingComponent === componentId) {
                return;
            }
            
            const component = this.propertiesContainer.querySelector(`#${componentId}`);
            const propertyName = componentPropertyMap[componentId];
            
            if (component) {
                const propertyValue = (properties as any)[propertyName];
                
                // Update the component value
                if (propertyValue !== undefined) {
                    // For number inputs, round the value
                    if (['x', 'y', 'width', 'height', 'strokeWidth'].includes(propertyName)) {
                        const roundedValue = Math.round(propertyValue);
                        component.setAttribute('value', roundedValue.toString());
                        (component as any).value = roundedValue;
                        // Update units display for position/size inputs
                        if (['x', 'y', 'width', 'height'].includes(propertyName)) {
                            const dimension = propertyName === 'x' || propertyName === 'width' ? 'width' : 'height';
                            const units = this.viewportManager.formatViewportUnit(propertyValue, dimension);
                            component.setAttribute('units', units);
                            (component as any).units = units;
                        }
                    } else {
                        const stringValue = propertyValue || '';
                        component.setAttribute('value', stringValue);
                        (component as any).value = stringValue;
                    }
                }
            }
        });
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
                    
                    // Temporarily store which component triggered the update to avoid overwriting it
                    (this as any)._updatingComponent = componentId;
                    this.elementManager.updateElementProperties(element.id, updates);
                    delete (this as any)._updatingComponent;

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
                        
                        // Temporarily store which component triggered the update
                        (this as any)._updatingComponent = componentId;
                        this.elementManager.updateElementProperties(element.id, updates);
                        delete (this as any)._updatingComponent;
                    }
                });
            }
        });
    }

    private attachCollapseControls(): void {
        // Add event listeners for the properties header component events
        const header = this.propertiesContainer.querySelector('properties-header');
        
        if (header) {
            header.addEventListener('expand-all', () => {
                const propertyGroups = this.propertiesContainer.querySelectorAll('property-group');
                propertyGroups.forEach(group => {
                    (group as any).expand();
                });
            });
            
            header.addEventListener('collapse-all', () => {
                const propertyGroups = this.propertiesContainer.querySelectorAll('property-group');
                propertyGroups.forEach(group => {
                    (group as any).collapse();
                });
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
