/// <reference types="vite/client" />

// Type declarations for raw imports
declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}
