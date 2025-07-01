import templateHtml from './PropertyTextInput.html?raw';
import styles from './PropertyTextInput.css?raw';

export class PropertyTextInputComponent extends HTMLElement {
  private input: HTMLInputElement;
  private generateBtn: HTMLButtonElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.input = shadowRoot.querySelector('.input-field')!;
    this.generateBtn = shadowRoot.querySelector('.generate-btn')!;
    
    // Set up event listeners
    this.input.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('input-changed', {
        detail: { value: this.input.value },
        bubbles: true
      }));
    });
    
    this.generateBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('generate-clicked', {
        bubbles: true
      }));
    });
  }

  connectedCallback() {
    this.updateFromAttributes();
  }

  static get observedAttributes() {
    return ['label', 'placeholder', 'help-text', 'value', 'pattern', 'title', 'show-generate'];
  }

  attributeChangedCallback() {
    this.updateFromAttributes();
  }

  private updateFromAttributes() {
    const label = this.shadowRoot?.querySelector('.label');
    const helpText = this.shadowRoot?.querySelector('.help-text');
    
    if (label) {
      label.textContent = this.getAttribute('label') || '';
    }
    
    if (helpText) {
      helpText.textContent = this.getAttribute('help-text') || '';
    }
    
    this.input.placeholder = this.getAttribute('placeholder') || '';
    this.input.value = this.getAttribute('value') || '';
    this.input.pattern = this.getAttribute('pattern') || '';
    this.input.title = this.getAttribute('title') || '';
    
    const showGenerate = this.getAttribute('show-generate') !== 'false';
    this.generateBtn.style.display = showGenerate ? 'block' : 'none';
  }

  get value(): string {
    return this.input.value;
  }

  set value(val: string) {
    this.input.value = val;
    this.setAttribute('value', val);
  }
}

customElements.define('property-text-input', PropertyTextInputComponent);
