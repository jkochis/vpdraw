import templateHtml from './PropertyColorInput.html?raw';
import styles from './PropertyColorInput.css?raw';

export class PropertyColorInputComponent extends HTMLElement {
  private input: HTMLInputElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.input = shadowRoot.querySelector('.input-field')!;
    
    // Set up event listeners
    this.input.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('input-changed', {
        detail: { value: this.input.value },
        bubbles: true
      }));
    });
  }

  connectedCallback() {
    this.updateFromAttributes();
  }

  static get observedAttributes() {
    return ['label', 'value'];
  }

  attributeChangedCallback() {
    this.updateFromAttributes();
  }

  private updateFromAttributes() {
    const label = this.shadowRoot?.querySelector('.label');
    
    if (label) {
      label.textContent = this.getAttribute('label') || '';
    }
    
    this.input.value = this.getAttribute('value') || '#000000';
  }

  get value(): string {
    return this.input.value;
  }

  set value(val: string) {
    this.input.value = val;
    this.setAttribute('value', val);
  }
}

customElements.define('property-color-input', PropertyColorInputComponent);
