import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CSSExporter } from '../app/export/CSSExporter'
import { ElementManager } from '../app/elements/ElementManager'
import { ViewportManager } from '../app/viewport/ViewportManager'

// Mock the required DOM elements
const mockTextArea = {
  value: '',
  id: 'css-output'
}

describe('CSSExporter', () => {
  let cssExporter: CSSExporter
  let elementManager: ElementManager
  let viewportManager: ViewportManager
  let mockCanvas: any

  // Helper function to create mock elements with required shape property
  const createMockElement = (overrides: any) => ({
    shape: {} as any, // Mock Konva shape
    ...overrides
  })

  beforeEach(() => {
    // Mock the document.getElementById for css-output element
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'css-output') {
        return mockTextArea as any
      }
      return null
    })

    // Mock canvas element
    mockCanvas = {
      getContainer: vi.fn(() => ({ addEventListener: vi.fn() })),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      getLayers: vi.fn(() => []),
      width: vi.fn(() => 1920),
      height: vi.fn(() => 1080),
      add: vi.fn()
    }

    // Mock stage
    const mockStage = {
      getContainer: vi.fn(() => ({ addEventListener: vi.fn() })),
      on: vi.fn(),
      off: vi.fn()
    }

    elementManager = new ElementManager(mockCanvas, mockStage as any)
    viewportManager = new ViewportManager()
    viewportManager.setCanvasDimensions(1920, 1080)

    cssExporter = new CSSExporter(elementManager, viewportManager)
  })

  describe('constructor', () => {
    it('should throw error if css-output element not found', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null)
      
      expect(() => {
        new CSSExporter(elementManager, viewportManager)
      }).toThrow('CSS output element not found')
    })

    it('should initialize successfully with valid elements', () => {
      expect(cssExporter).toBeInstanceOf(CSSExporter)
    })
  })

  describe('updateCSS', () => {
    it('should generate empty CSS when no elements exist', () => {
      cssExporter.updateCSS()
      
      expect(mockTextArea.value).toBe('/* No elements to export */')
    })

    it('should generate CSS header with canvas information', () => {
      // Add a test element
      const mockElement = createMockElement({
        id: 'test-1',
        type: 'rectangle' as const,
        properties: {
          x: 100,
          y: 50,
          width: 200,
          height: 100,
          fill: '#ff0000'
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      cssExporter.updateCSS()
      
      expect(mockTextArea.value).toContain('/* VPDraw Generated CSS */')
      expect(mockTextArea.value).toContain('/* Canvas: Desktop HD (Landscape) - Landscape */')
      expect(mockTextArea.value).toContain('/* Dimensions: 1920×1080px */')
    })

    it('should generate CSS for rectangle elements', () => {
      const mockElement = createMockElement({
        id: 'rect-1',
        type: 'rectangle' as const,
        properties: {
          x: 192,
          y: 108,
          width: 384,
          height: 216,
          fill: '#ff0000',
          stroke: '#000000',
          strokeWidth: 2
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      cssExporter.updateCSS()
      
      const css = mockTextArea.value
      expect(css).toContain('.element-rect-1 {')
      expect(css).toContain('left: 10vw;')
      expect(css).toContain('top: 10vh;')
      expect(css).toContain('width: 20vw;')
      expect(css).toContain('height: 20vh;')
      expect(css).toContain('background-color: #ff0000;')
      expect(css).toContain('border: 2px solid #000000;')
    })

    it('should generate CSS for text elements', () => {
      const mockElement = createMockElement({
        id: 'text-1',
        type: 'text' as const,
        properties: {
          x: 100,
          y: 100,
          width: 200,
          height: 50,
          text: 'Hello World',
          fontSize: 24,
          fontFamily: 'Arial, sans-serif'
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      cssExporter.updateCSS()
      
      const css = mockTextArea.value
      expect(css).toContain('.element-text-1 {')
      expect(css).toContain('font-size: 2.22vh;') // 24px converted to vh
      expect(css).toContain('font-family: Arial, sans-serif;')
      expect(css).toContain('display: flex;')
      expect(css).toContain('align-items: center;')
      expect(css).toContain('justify-content: center;')
    })

    it('should use custom class name if provided', () => {
      const mockElement = createMockElement({
        id: 'test-1',
        type: 'rectangle' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          className: 'my-custom-class'
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      cssExporter.updateCSS()
      
      expect(mockTextArea.value).toContain('.my-custom-class {')
      expect(mockTextArea.value).not.toContain('.element-test-1 {')
    })
  })

  describe('generateHTML', () => {
    it('should return empty container for no elements', () => {
      const html = cssExporter.generateHTML([])
      expect(html).toBe('<div class="container"><!-- No elements --></div>')
    })

    it('should generate HTML for rectangle elements', () => {
      const elements = [createMockElement({
        id: 'rect-1',
        type: 'rectangle' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          className: 'my-rect'
        }
      })]

      const html = cssExporter.generateHTML(elements)
      
      expect(html).toContain('<div class="container">')
      expect(html).toContain('<div class="my-rect"></div>')
      expect(html).toContain('</div>')
    })

    it('should generate HTML for text elements', () => {
      const elements = [createMockElement({
        id: 'text-1',
        type: 'text' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          text: 'Hello World',
          className: 'my-text'
        }
      })]

      const html = cssExporter.generateHTML(elements)
      
      expect(html).toContain('<div class="my-text">Hello World</div>')
    })

    it('should handle missing text property', () => {
      const elements = [createMockElement({
        id: 'text-1',
        type: 'text' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 50
        }
      })]

      const html = cssExporter.generateHTML(elements)
      
      expect(html).toContain('<div class="element-text-1">Text Element</div>')
    })
  })

  describe('exportToClipboard', () => {
    it('should copy CSS and HTML to clipboard', async () => {
      const mockElement = createMockElement({
        id: 'test-1',
        type: 'rectangle' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText')
      
      await cssExporter.exportToClipboard()
      
      expect(clipboardSpy).toHaveBeenCalledWith(
        expect.stringContaining('<!-- HTML -->')
      )
      expect(clipboardSpy).toHaveBeenCalledWith(
        expect.stringContaining('/* CSS */')
      )
    })

    it('should handle clipboard write failure', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Clipboard error'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await cssExporter.exportToClipboard()
      
      expect(console.error).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
    })
  })

  describe('exportAsFile', () => {
    it('should create and download HTML file', () => {
      const mockElement = createMockElement({
        id: 'test-1',
        type: 'rectangle' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      // Mock document methods with proper style handling
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {
          cssText: '',
          setProperty: vi.fn(),
          getPropertyValue: vi.fn()
        }
      }
      
      const mockDiv = {
        textContent: '',
        style: {
          cssText: '',
          setProperty: vi.fn(),
          getPropertyValue: vi.fn()
        }
      }
      
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') return mockAnchor as any
        if (tagName === 'div') return mockDiv as any
        return {} as any
      })
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockDiv as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockDiv as any)
      
      cssExporter.exportAsFile()
      
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAnchor.download).toBe('vpdraw-export.html')
      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('should generate complete HTML document', () => {
      const mockElement = createMockElement({
        id: 'test-1',
        type: 'text' as const,
        properties: {
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          text: 'Test Text'
        }
      })

      vi.spyOn(elementManager, 'getAllElements').mockReturnValue([mockElement])
      
      // Capture the blob content
      let blobContent = ''
      vi.spyOn(window, 'Blob').mockImplementation((content?: any) => {
        if (content && content[0]) {
          blobContent = content[0] as string
        }
        return {} as Blob
      })
      
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {
          cssText: '',
          setProperty: vi.fn(),
          getPropertyValue: vi.fn()
        }
      }
      
      const mockDiv = {
        textContent: '',
        style: {
          cssText: '',
          setProperty: vi.fn(),
          getPropertyValue: vi.fn()
        }
      }
      
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') return mockAnchor as any
        if (tagName === 'div') return mockDiv as any
        return {} as any
      })
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockDiv as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockDiv as any)
      
      cssExporter.exportAsFile()
      
      expect(blobContent).toContain('<!DOCTYPE html>')
      expect(blobContent).toContain('<html lang="en">')
      expect(blobContent).toContain('<head>')
      expect(blobContent).toContain('<meta charset="UTF-8">')
      expect(blobContent).toContain('<title>VPDraw Export</title>')
      expect(blobContent).toContain('<style>')
      expect(blobContent).toContain('</style>')
      expect(blobContent).toContain('<body>')
      expect(blobContent).toContain('Test Text')
      expect(blobContent).toContain('</body>')
      expect(blobContent).toContain('</html>')
    })
  })
})
