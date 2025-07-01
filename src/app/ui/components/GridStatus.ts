import templateHtml from './GridStatus.html?raw';
import styles from './GridStatus.css?raw';

export class GridStatusComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.updateStatus();
  }
  
  connectedCallback() {
    this.updateStatus();
    // Listen for changes to the snap-to-grid checkbox
    this.startStatusPolling();
  }
  
  disconnectedCallback() {
    this.stopStatusPolling();
  }
  
  private statusInterval?: number;
  
  private startStatusPolling(): void {
    // Update status every 1000ms to reflect checkbox changes
    this.statusInterval = window.setInterval(() => {
      this.updateStatus();
    }, 1000);
  }
  
  private stopStatusPolling(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }
  
  private updateStatus(): void {
    const statusDiv = this.shadowRoot!.querySelector('.status');
    const snapCheckbox = document.getElementById('snap-to-grid') as HTMLInputElement;
    
    if (statusDiv) {
      const isEnabled = snapCheckbox?.checked ? 'enabled' : 'disabled';
      statusDiv.textContent = `💡 Grid snapping is ${isEnabled}`;
    }
  }
  
  public refresh(): void {
    this.updateStatus();
  }
}

customElements.define('grid-status', GridStatusComponent);
