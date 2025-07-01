export class PropertyTextInputComponent extends HTMLElement {
  private input: HTMLInputElement;
  private generateBtn: HTMLButtonElement;

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
        
        .generate-btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          background: #646cff;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        
        .generate-btn:hover {
          background: #535bf2;
        }
        
        .generate-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .help-text {
          font-size: 0.75rem;
          opacity: 0.7;
          color: #6b7280;
        }
      </style>
      
      <div class="property-row">
        <label class="label"></label>
        <div class="input-container">
          <input class="input-field" type="text" />
          <button class="generate-btn" type="button">Generate</button>
        </div>
        <small class="help-text"></small>
      </div>
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
