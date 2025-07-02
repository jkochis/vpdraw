import templateHtml from './PropertyNumberInput.html?raw';
import styles from './PropertyNumberInput.css?raw';

export class PropertyNumberInputComponent extends HTMLElement {
  private input: HTMLInputElement;
  private unitsDisplay: HTMLSpanElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.input = shadowRoot.querySelector('.input-field')!;
    this.unitsDisplay = shadowRoot.querySelector('.units-display')!;
    
    // Set up event listeners
    this.input.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('input-changed', {
        detail: { value: this.parseValue(this.input.value) },
        bubbles: true
      }));
    });
  }

  connectedCallback() {
    this.updateFromAttributes();
  }

  static get observedAttributes() {
    return ['label', 'value', 'units', 'min', 'max'];
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null) {
    this.updateFromAttributes();
  }

  private updateFromAttributes() {
    const label = this.shadowRoot!.querySelector('.label')!;
    label.textContent = this.getAttribute('label') || '';

    this.input.value = this.getAttribute('value') || '';
    this.unitsDisplay.textContent = this.getAttribute('units') || '';

    if (this.hasAttribute('min')) {
      this.input.min = this.getAttribute('min')!;
    }
    if (this.hasAttribute('max')) {
      this.input.max = this.getAttribute('max')!;
    }
  }

  private parseValue(value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  get value(): number {
    return this.parseValue(this.input.value);
  }

  set value(val: number) {
    this.input.value = val.toString();
    this.setAttribute('value', val.toString());
  }

  get units(): string {
    return this.getAttribute('units') || '';
  }

  set units(val: string) {
    this.setAttribute('units', val);
    this.unitsDisplay.textContent = val;
  }
}

customElements.define('property-number-input', PropertyNumberInputComponent);
