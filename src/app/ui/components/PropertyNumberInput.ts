export class PropertyNumberInputComponent extends HTMLElement {
  private input: HTMLInputElement;
  private unitsDisplay: HTMLSpanElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .property-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .input-field {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: inherit;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #646cff;
          box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
        }
        
        .units-display {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          min-width: 3rem;
          text-align: center;
          white-space: nowrap;
        }
        
        .label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
      </style>
      
      <div class="property-row">
        <label class="label"></label>
        <div class="input-container">
          <input class="input-field" type="number" />
          <span class="units-display"></span>
        </div>
      </div>
    `;
    
    this.input = shadowRoot.querySelector('.input-field')!;
    this.unitsDisplay = shadowRoot.querySelector('.units-display')!;
    
    // Set up event listeners
    this.input.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('input-changed', {
        detail: { value: parseFloat(this.input.value) || 0 },
        bubbles: true
      }));
    });
  }

  connectedCallback() {
    this.updateFromAttributes();
  }

  static get observedAttributes() {
    return ['label', 'value', 'min', 'max', 'step', 'units'];
  }

  attributeChangedCallback() {
    this.updateFromAttributes();
  }

  private updateFromAttributes() {
    const label = this.shadowRoot?.querySelector('.label');
    
    if (label) {
      label.textContent = this.getAttribute('label') || '';
    }
    
    this.input.value = this.getAttribute('value') || '';
    this.input.min = this.getAttribute('min') || '';
    this.input.max = this.getAttribute('max') || '';
    this.input.step = this.getAttribute('step') || '';
    
    this.unitsDisplay.textContent = this.getAttribute('units') || '';
  }

  get value(): number {
    return parseFloat(this.input.value) || 0;
  }

  set value(val: number) {
    this.input.value = val.toString();
    this.setAttribute('value', val.toString());
  }

  set units(val: string) {
    this.unitsDisplay.textContent = val;
    this.setAttribute('units', val);
  }
}

customElements.define('property-number-input', PropertyNumberInputComponent);
