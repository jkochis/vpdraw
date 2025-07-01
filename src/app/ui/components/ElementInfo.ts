import templateHtml from './ElementInfo.html?raw';
import styles from './ElementInfo.css?raw';

export class ElementInfoComponent extends HTMLElement {
  static get observedAttributes() {
    return ['element-type', 'element-id'];
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.updateContent();
  }
  
  attributeChangedCallback() {
    this.updateContent();
  }
  
  private updateContent(): void {
    const systemIdDiv = this.shadowRoot!.querySelector('.system-id');
    const elementId = this.getAttribute('element-id');
    
    if (systemIdDiv && elementId) {
      systemIdDiv.textContent = `System ID: ${elementId}`;
    }
  }
  
  get elementType(): string {
    return this.getAttribute('element-type') || '';
  }
  
  set elementType(value: string) {
    this.setAttribute('element-type', value);
  }
  
  get elementId(): string {
    return this.getAttribute('element-id') || '';
  }
  
  set elementId(value: string) {
    this.setAttribute('element-id', value);
  }
}

customElements.define('element-info', ElementInfoComponent);
