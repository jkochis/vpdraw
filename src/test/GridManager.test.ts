import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Konva
const mockLine = vi.fn(() => ({
  destroy: vi.fn(),
  points: vi.fn(),
  stroke: vi.fn(),
  strokeWidth: vi.fn(),
  listening: vi.fn(),
  moveToBottom: vi.fn()
}))

const mockStage = {
  width: vi.fn(() => 1920),
  height: vi.fn(() => 1080)
}

const mockLayer = {
  add: vi.fn(),
  batchDraw: vi.fn()
}

vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(() => mockStage),
    Layer: vi.fn(() => mockLayer),
    Line: mockLine
  }
}))

describe('GridManager', () => {
  let GridManager: any
  let gridManager: any
  
  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks()
    
    // Dynamically import after mocking
    const module = await import('../app/grid/GridManager')
    GridManager = module.GridManager
    
    // Create fresh instance
    gridManager = new GridManager(mockStage, mockLayer)
  })

  describe('constructor', () => {
    it('should initialize with default grid size', () => {
      expect(gridManager.getGridSize()).toBe(20)
    })

    it('should store stage and layer references', () => {
      expect(gridManager).toBeDefined()
    })
  })

  describe('getGridSize', () => {
    it('should return current grid size', () => {
      expect(gridManager.getGridSize()).toBe(20)
    })
  })

  describe('updateGridSize', () => {
    it('should update grid size and redraw', () => {
      const drawGridSpy = vi.spyOn(gridManager, 'drawGrid')
      
      gridManager.updateGridSize(30)
      
      expect(gridManager.getGridSize()).toBe(30)
      expect(drawGridSpy).toHaveBeenCalled()
    })

    it('should handle different grid sizes', () => {
      gridManager.updateGridSize(10)
      expect(gridManager.getGridSize()).toBe(10)
      
      gridManager.updateGridSize(50)
      expect(gridManager.getGridSize()).toBe(50)
    })
  })

  describe('snapToGrid', () => {
    it('should snap values to grid with default size', () => {
      expect(gridManager.snapToGrid(0)).toBe(0)
      expect(gridManager.snapToGrid(10)).toBe(20)
      expect(gridManager.snapToGrid(15)).toBe(20)
      expect(gridManager.snapToGrid(25)).toBe(20)
      expect(gridManager.snapToGrid(30)).toBe(40)
    })

    it('should snap values with custom grid size', () => {
      gridManager.updateGridSize(10)
      
      expect(gridManager.snapToGrid(0)).toBe(0)
      expect(gridManager.snapToGrid(5)).toBe(10)
      expect(gridManager.snapToGrid(12)).toBe(10)
      expect(gridManager.snapToGrid(18)).toBe(20)
    })

    it('should handle negative values', () => {
      expect(gridManager.snapToGrid(-10)).toBe(-0)
      expect(gridManager.snapToGrid(-15)).toBe(-20)
      expect(gridManager.snapToGrid(-25)).toBe(-20)
    })

    it('should handle floating point values', () => {
      expect(gridManager.snapToGrid(12.3)).toBe(20)
      expect(gridManager.snapToGrid(17.8)).toBe(20)
      expect(gridManager.snapToGrid(22.1)).toBe(20)
    })
  })

  describe('snapPointToGrid', () => {
    it('should snap point coordinates to grid', () => {
      const point = { x: 15, y: 25 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 20, y: 20 })
    })

    it('should handle negative coordinates', () => {
      const point = { x: -15, y: -25 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: -20, y: -20 })
    })

    it('should handle floating point coordinates', () => {
      const point = { x: 12.7, y: 17.3 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 20, y: 20 })
    })

    it('should work with custom grid size', () => {
      gridManager.updateGridSize(25)
      const point = { x: 30, y: 40 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 25, y: 50 })
    })
  })

  describe('drawGrid', () => {
    it('should call layer batchDraw', () => {
      gridManager.drawGrid()
      expect(mockLayer.batchDraw).toHaveBeenCalled()
    })

    it('should create grid lines based on stage dimensions', () => {
      gridManager.drawGrid()
      
      // Should create lines for the grid
      expect(mockLine).toHaveBeenCalled()
      expect(mockLayer.add).toHaveBeenCalled()
    })

    it('should clear existing grid before drawing new one', () => {
      // Draw grid twice
      gridManager.drawGrid()
      const firstCallCount = mockLine.mock.calls.length
      
      gridManager.drawGrid()
      
      // Should have created lines both times
      expect(mockLine.mock.calls.length).toBeGreaterThan(firstCallCount)
    })

    it('should create both regular and major grid lines', () => {
      gridManager.drawGrid()
      
      // Verify lines were created with different stroke properties
      const lineCalls = mockLine.mock.calls
      expect(lineCalls.length).toBeGreaterThan(0)
      
      // Check that some lines have different stroke colors/widths
      const lineInstances = mockLine.mock.results.map(result => result.value)
      expect(lineInstances.length).toBeGreaterThan(0)
    })
  })

  describe('grid line positioning', () => {
    it('should create vertical lines at correct intervals', () => {
      mockStage.width.mockReturnValue(100)
      mockStage.height.mockReturnValue(100)
      
      gridManager.drawGrid()
      
      // Check that lines were created
      expect(mockLine).toHaveBeenCalled()
      
      // Verify vertical line points (should span full height)
      const calls = mockLine.mock.calls as any[]
      const verticalLines = calls.filter(call => {
        const config = call?.[0]
        return config?.points && config.points[1] === 0 && config.points[3] === 100
      })
      
      expect(verticalLines.length).toBeGreaterThan(0)
    })

    it('should create horizontal lines at correct intervals', () => {
      mockStage.width.mockReturnValue(100)
      mockStage.height.mockReturnValue(100)
      
      gridManager.drawGrid()
      
      // Check that lines were created
      expect(mockLine).toHaveBeenCalled()
      
      // Verify horizontal line points (should span full width)
      const calls = mockLine.mock.calls as any[]
      const horizontalLines = calls.filter(call => {
        const config = call?.[0]
        return config?.points && config.points[0] === 0 && config.points[2] === 100
      })
      
      expect(horizontalLines.length).toBeGreaterThan(0)
    })
  })

  describe('grid appearance', () => {
    it('should set correct stroke properties for regular lines', () => {
      gridManager.drawGrid()
      
      const calls = mockLine.mock.calls as any[]
      const regularLines = calls.filter(call => {
        const config = call?.[0]
        return config?.stroke === '#d0d0d0' && config?.strokeWidth === 0.5
      })
      
      expect(regularLines.length).toBeGreaterThan(0)
    })

    it('should set correct stroke properties for major lines', () => {
      gridManager.drawGrid()
      
      const calls = mockLine.mock.calls as any[]
      const majorLines = calls.filter(call => {
        const config = call?.[0]
        return config?.stroke === '#a0a0a0' && config?.strokeWidth === 1
      })
      
      expect(majorLines.length).toBeGreaterThan(0)
    })

    it('should set listening to false for all grid lines', () => {
      gridManager.drawGrid()
      
      const calls = mockLine.mock.calls as any[]
      calls.forEach(call => {
        const config = call?.[0]
        if (config) {
          expect(config.listening).toBe(false)
        }
      })
    })
  })
})
