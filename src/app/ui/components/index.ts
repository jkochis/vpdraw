// Import all web components to register them
import './PropertyGroup';
import './PropertyTextInput';
import './PropertyNumberInput';
import './PropertyColorInput';
import './PropertiesHeader';
import './ElementInfo';
import './GridStatus';

// Export types for TypeScript
export { PropertyGroupComponent } from './PropertyGroup';
export { PropertyTextInputComponent } from './PropertyTextInput';
export { PropertyNumberInputComponent } from './PropertyNumberInput';
export { PropertyColorInputComponent } from './PropertyColorInput';

// Ensure all components are registered
export function registerComponents() {
  // Components are registered via their individual files
  // This function can be called to ensure all are loaded
}
