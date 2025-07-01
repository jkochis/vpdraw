import templateHtml from './PropertiesHeader.html?raw';
import styles from './PropertiesHeader.css?raw';

export class PropertiesHeaderComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    const expandBtn = this.shadowRoot!.querySelector('.expand-btn');
    const collapseBtn = this.shadowRoot!.querySelector('.collapse-btn');
    
    expandBtn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('expand-all', { bubbles: true }));
    });
    
    collapseBtn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('collapse-all', { bubbles: true }));
    });
  }
}

customElements.define('properties-header', PropertiesHeaderComponent);
