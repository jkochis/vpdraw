import { ElementManager } from '../elements/ElementManager';
import type { DrawElement } from '../elements/ElementManager';
import { ViewportManager } from '../viewport/ViewportManager';
import { ViewportPresets } from '../viewport/ViewportPresets';

export class CSSExporter {
  private elementManager: ElementManager;
  private viewportManager: ViewportManager;
  private cssOutput: HTMLTextAreaElement;

  constructor(elementManager: ElementManager, viewportManager: ViewportManager) {
    this.elementManager = elementManager;
    this.viewportManager = viewportManager;
    
    const cssOutputElement = document.getElementById('css-output') as HTMLTextAreaElement;
    if (!cssOutputElement) {
      throw new Error('CSS output element not found');
    }
    this.cssOutput = cssOutputElement;

    this.setupEventListeners();
    this.updateCSS();
  }

  private setupEventListeners(): void {
    // Use the new listener system instead of overwriting the callback
    this.elementManager.addElementUpdateListener(() => {
      this.updateCSS();
    });

    this.elementManager.addSelectionChangeListener(() => {
      this.updateCSS();
    });
  }

  public updateCSS(): void {
    const elements = this.elementManager.getAllElements();
    const css = this.generateCSS(elements);
    this.cssOutput.value = css;
  }

  private generateCSS(elements: DrawElement[]): string {
    if (elements.length === 0) {
      return '/* No elements to export */';
    }

    const { width: canvasWidth, height: canvasHeight } = this.viewportManager.getCanvasDimensions();
    const presets = new ViewportPresets();
    const orientation = presets.getOrientationName(canvasWidth, canvasHeight);
    const presetName = presets.getPresetNameForDimensions(canvasWidth, canvasHeight);

    let css = `/* VPDraw Generated CSS */
/* Generated on ${new Date().toLocaleString()} */
/* Canvas: ${presetName} - ${orientation} */
/* Dimensions: ${canvasWidth}×${canvasHeight}px */

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

`;

    elements.forEach(element => {
      css += this.generateElementCSS(element);
      css += '\n';
    });

    return css;
  }

  private generateElementCSS(element: DrawElement): string {
    const { properties, type } = element;
    const className = properties.className || `element-${element.id}`;
    
    let css = `.${className} {\n`;
    
    // Position and size using viewport units
    css += `  position: absolute;\n`;
    css += `  left: ${this.viewportManager.formatViewportUnit(properties.x, 'width')};\n`;
    css += `  top: ${this.viewportManager.formatViewportUnit(properties.y, 'height')};\n`;
    css += `  width: ${this.viewportManager.formatViewportUnit(properties.width, 'width')};\n`;
    css += `  height: ${this.viewportManager.formatViewportUnit(properties.height, 'height')};\n`;
    
    // Type-specific properties
    if (type === 'rectangle') {
      if (properties.fill) {
        css += `  background-color: ${properties.fill};\n`;
      }
    }
    
    // Border properties
    if (properties.stroke && properties.strokeWidth) {
      css += `  border: ${properties.strokeWidth}px solid ${properties.stroke};\n`;
    }
    
    // Box model
    css += `  box-sizing: border-box;\n`;
    
    css += `}`;
    
    return css;
  }

  public generateHTML(elements: DrawElement[]): string {
    if (elements.length === 0) {
      return '<div class="container"><!-- No elements --></div>';
    }

    let html = '<div class="container">\n';
    
    elements.forEach(element => {
      const { properties, type } = element;
      const className = properties.className || `element-${element.id}`;
      
      if (type === 'rectangle') {
        html += `  <div class="${className}"></div>\n`;
      } else if (type === 'text') {
        const text = properties.text || 'Text Element';
        html += `  <div class="${className}">${text}</div>\n`;
      }
    });
    
    html += '</div>';
    
    return html;
  }

  public async exportToClipboard(): Promise<void> {
    const elements = this.elementManager.getAllElements();
    const css = this.generateCSS(elements);
    const html = this.generateHTML(elements);
    
    const fullExport = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}`;
    
    try {
      await navigator.clipboard.writeText(fullExport);
      this.showNotification('CSS and HTML copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      this.showNotification('Failed to copy to clipboard', 'error');
    }
  }

  public exportAsFile(): void {
    const elements = this.elementManager.getAllElements();
    const css = this.generateCSS(elements);
    const html = this.generateHTML(elements);
    
    const fullExport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VPDraw Export</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullExport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vpdraw-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('File downloaded successfully!');
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}
