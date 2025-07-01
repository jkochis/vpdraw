export class PropertyColorInputComponent extends HTMLElement {
  private input: HTMLInputElement;

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
        
        .input-field {
          width: 100%;
          height: 2.5rem;
          padding: 0.25rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #646cff;
          box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
        }
        
        .label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
      </style>
      
      <div class="property-row">
        <label class="label"></label>
        <input class="input-field" type="color" />
      </div>
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
