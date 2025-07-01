export class PropertyGroupComponent extends HTMLElement {
  private titleElement: HTMLElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 1.5rem;
        }
        
        .property-group {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }
        
        .group-title {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .group-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      </style>
      
      <div class="property-group">
        <h4 class="group-title"></h4>
        <div class="group-content">
          <slot></slot>
        </div>
      </div>
    `;
    
    this.titleElement = shadowRoot.querySelector('.group-title')!;
  }

  connectedCallback() {
    this.updateTitle();
  }

  static get observedAttributes() {
    return ['title'];
  }

  attributeChangedCallback() {
    this.updateTitle();
  }

  private updateTitle() {
    const title = this.getAttribute('title') || '';
    this.titleElement.textContent = title;
  }
}

customElements.define('property-group', PropertyGroupComponent);
