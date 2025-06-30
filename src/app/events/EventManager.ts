import { ToolManager } from '../tools/ToolManager';
import { GridManager } from '../grid/GridManager';
import { PropertiesPanel } from '../ui/PropertiesPanel';
import { CSSExporter } from '../export/CSSExporter';
import { ElementManager } from '../elements/ElementManager';

export class EventManager {
  private toolManager: ToolManager;
  private cssExporter: CSSExporter; // For future export shortcuts
  private elementManager: ElementManager;

  constructor(
    toolManager: ToolManager,
    gridManager: GridManager,
    propertiesPanel: PropertiesPanel,
    cssExporter: CSSExporter,
    elementManager: ElementManager,
    app?: any
  ) {
    this.toolManager = toolManager;
    // Store for future use but don't assign to prevent unused variable warnings
    void gridManager;
    void propertiesPanel;
    void app;
    this.cssExporter = cssExporter;
    this.elementManager = elementManager;
    
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Delete selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedElements = this.elementManager.getSelectedElements();
        if (selectedElements.length > 0) {
          selectedElements.forEach(element => {
            this.elementManager.deleteElement(element.id);
          });
          e.preventDefault();
        }
      }
      
      // Tool shortcuts
      if (e.key === '1') {
        this.toolManager.setTool('select');
        e.preventDefault();
      } else if (e.key === '2') {
        this.toolManager.setTool('rectangle');
        e.preventDefault();
      }
      
      // Copy/Paste and other shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          // Select all elements
          const allElements = this.elementManager.getAllElements();
          if (allElements.length > 0) {
            this.elementManager.selectMultipleElements(allElements);
          }
          e.preventDefault();
        } else if (e.key === 'c') {
          // Copy selected element (future implementation)
          const selected = this.elementManager.getSelectedElement();
          if (selected) {
            console.log('Copy functionality - to be implemented');
          }
          e.preventDefault();
        } else if (e.key === 'v') {
          // Paste element (future implementation)
          console.log('Paste functionality - to be implemented');
          e.preventDefault();
        } else if (e.key === 'z') {
          // Undo (future implementation)
          console.log('Undo functionality - to be implemented');
          e.preventDefault();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
          // Redo (future implementation)
          console.log('Redo functionality - to be implemented');
          e.preventDefault();
        } else if (e.key === 'e') {
          // Export shortcut
          this.cssExporter.exportToClipboard();
          e.preventDefault();
        }
      }
      
      // Grid shortcuts
      if (e.key === 'g') {
        const snapToGrid = document.getElementById('snap-to-grid') as HTMLInputElement;
        if (snapToGrid) {
          snapToGrid.checked = !snapToGrid.checked;
          snapToGrid.dispatchEvent(new Event('change'));
          
          // Update visual feedback
          this.showGridToggleNotification(snapToGrid.checked);
        }
        e.preventDefault();
      }
      
      // Orientation toggle shortcut
      if (e.key === 'r') {
        const toggleBtn = document.getElementById('toggle-orientation');
        if (toggleBtn) {
          toggleBtn.click(); // This will trigger the app's orientation logic with scaling
        }
        e.preventDefault();
      }
      
      // Preset shortcuts with proportional scaling
      if (e.key >= '4' && e.key <= '9') {
        const presetSelect = document.getElementById('viewport-presets') as HTMLSelectElement;
        if (presetSelect) {
          const index = parseInt(e.key) - 3; // Start from 4th key (4 = index 1)
          if (index < presetSelect.options.length) {
            presetSelect.selectedIndex = index;
            presetSelect.dispatchEvent(new Event('change')); // This will trigger the app's preset logic with scaling
          }
        }
        e.preventDefault();
      }
    });
  }

  private showGridToggleNotification(enabled: boolean): void {
    // Create a simple notification for grid toggle
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${enabled ? '#4caf50' : '#ff9800'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = `Grid snapping ${enabled ? 'enabled' : 'disabled'}`;
    
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
}
