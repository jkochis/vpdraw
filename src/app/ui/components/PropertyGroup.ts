import templateHtml from './PropertyGroup.html?raw';
import styles from './PropertyGroup.css?raw';

export class PropertyGroupComponent extends HTMLElement {
  private titleElement: HTMLElement;
  private contentElement: HTMLElement;
  private toggleIcon: HTMLElement;
  private isCollapsed = true;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${templateHtml}
    `;
    
    this.titleElement = shadowRoot.querySelector('.group-title')!;
    this.contentElement = shadowRoot.querySelector('.group-content')!;
    this.toggleIcon = shadowRoot.querySelector('.toggle-icon')!;
    
    // Start collapsed by default
    this.setAttribute('collapsed', '');
    
    // Add click handler for toggling
    shadowRoot.querySelector('.group-header')!.addEventListener('click', () => {
      this.toggle();
    });
    
    this.updateTitle();
    this.updateCollapsedState();
  }

  static get observedAttributes() {
    return ['title', 'collapsed'];
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
    if (name === 'title') {
      this.updateTitle();
    } else if (name === 'collapsed') {
      this.updateCollapsedState();
    }
  }

  private updateTitle() {
    if (this.titleElement) {
      this.titleElement.textContent = this.getAttribute('title') || '';
    }
  }

  private updateCollapsedState() {
    this.isCollapsed = this.hasAttribute('collapsed');
    this.contentElement.classList.toggle('collapsed', this.isCollapsed);
    this.toggleIcon.classList.toggle('collapsed', this.isCollapsed);
  }

  private toggle() {
    this.isCollapsed = !this.isCollapsed;
    
    if (this.isCollapsed) {
      this.setAttribute('collapsed', '');
    } else {
      this.removeAttribute('collapsed');
    }
    
    this.updateCollapsedState();
    
    this.dispatchEvent(new CustomEvent('toggle', {
      detail: { collapsed: this.isCollapsed },
      bubbles: true
    }));
  }

  // Public API methods
  public collapse() {
    if (!this.isCollapsed) {
      this.toggle();
    }
  }

  public expand() {
    if (this.isCollapsed) {
      this.toggle();
    }
  }

  public get collapsed() {
    return this.isCollapsed;
  }
}

customElements.define('property-group', PropertyGroupComponent);
