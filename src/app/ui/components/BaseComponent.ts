export abstract class BaseComponent extends HTMLElement {
  protected _shadowRoot: ShadowRoot;
  protected template: HTMLTemplateElement;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this.template = document.createElement('template');
    this.setupTemplate();
    this.render();
  }

  protected abstract setupTemplate(): void;

  protected render(): void {
    this._shadowRoot.innerHTML = '';
    this._shadowRoot.appendChild(this.template.content.cloneNode(true));
    this.attachEventListeners();
  }

  protected attachEventListeners(): void {
    // Override in subclasses if needed
  }

  protected getStyles(): string {
    return `
      <style>
        :host {
          display: block;
          font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
        }
        
        .property-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        
        input, select, button {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #646cff;
          box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
        }
        
        button {
          background: #646cff;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background: #535bf2;
        }
        
        button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .flex-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .flex-1 {
          flex: 1;
        }
        
        .text-sm {
          font-size: 0.75rem;
          opacity: 0.7;
        }
        
        .units-display {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          min-width: 3rem;
          text-align: center;
        }
      </style>
    `;
  }

  protected createPropertyRow(label: string, content: string, helpText?: string): string {
    return `
      <div class="property-row">
        <label>${label}:</label>
        ${content}
        ${helpText ? `<small class="text-sm">${helpText}</small>` : ''}
      </div>
    `;
  }
}
