import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Konva before other imports
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      getPointerPosition: vi.fn(() => ({ x: 100, y: 100 })),
      width: vi.fn(() => 1920),
      height: vi.fn(() => 1080),
      container: vi.fn(() => ({ style: {} })),
      add: vi.fn(),
      destroy: vi.fn()
    })),
    Layer: vi.fn(() => ({
      add: vi.fn(),
      batchDraw: vi.fn(),
      draw: vi.fn(),
      destroy: vi.fn()
    })),
    Transformer: vi.fn(() => ({
      nodes: vi.fn(),
      getNodes: vi.fn(() => []),
      forceUpdate: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    })),
    Rect: vi.fn(() => ({
      destroy: vi.fn(),
      moveToBottom: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      x: vi.fn(),
      y: vi.fn(),
      width: vi.fn(),
      height: vi.fn()
    })),
    Text: vi.fn(() => ({
      destroy: vi.fn(),
      moveToBottom: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      x: vi.fn(),
      y: vi.fn(),
      width: vi.fn(),
      height: vi.fn(),
      text: vi.fn(),
      fontSize: vi.fn()
    })),
    Line: vi.fn(() => ({
      destroy: vi.fn(),
      moveToBottom: vi.fn()
    }))
  },
  Stage: vi.fn(),
  Layer: vi.fn(),
  Transformer: vi.fn(),
  Rect: vi.fn(),
  Text: vi.fn(),
  Line: vi.fn()
}))

// Mock DOM elements and globals needed for canvas/Konva tests
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1080,
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
}

// Enhance createElement to return elements with proper properties
const originalCreateElement = document.createElement.bind(document)
document.createElement = function(tagName: string, options?: ElementCreationOptions) {
  const element = originalCreateElement(tagName, options)
  
  // For any element, ensure style property is completely mocked
  Object.defineProperty(element, 'style', {
    writable: true,
    configurable: true,
    value: {
      cssText: '',
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
      removeProperty: vi.fn(),
      position: '',
      top: '',
      right: '',
      background: '',
      color: '',
      padding: '',
      border: '',
      borderRadius: '',
      fontSize: '',
      zIndex: '',
      width: '',
      height: ''
    }
  })
  
  // Add download property for anchor elements
  if (tagName.toLowerCase() === 'a') {
    (element as any).download = ''
    ;(element as any).click = vi.fn()
    ;(element as any).href = ''
  }
  
  // Mock appendChild for all elements
  if (!element.appendChild) {
    element.appendChild = vi.fn()
  }
  
  // Mock body.appendChild specifically for notification elements
  if (!document.body.appendChild) {
    document.body.appendChild = vi.fn()
  }
  
  return element
}
