import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Konva before importing GridManager
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(),
    Layer: vi.fn(),
    Line: vi.fn(() => ({
      destroy: vi.fn(),
      points: vi.fn(),
      stroke: vi.fn(),
      strokeWidth: vi.fn(),
      opacity: vi.fn()
    }))
  }
}))

describe('GridManager (Simple)', () => {
  let GridManager: any
  
  beforeEach(async () => {
    // Dynamically import after mocking
    const module = await import('../app/grid/GridManager')
    GridManager = module.GridManager
  })

  it('should be importable without memory issues', () => {
    expect(GridManager).toBeDefined()
  })

  it('should create instance with mocked dependencies', () => {
    const mockStage = {
      width: vi.fn(() => 1920),
      height: vi.fn(() => 1080)
    }

    const mockLayer = {
      add: vi.fn(),
      batchDraw: vi.fn()
    }

    expect(() => {
      new GridManager(mockStage, mockLayer)
    }).not.toThrow()
  })

  it('should have basic methods', () => {
    const mockStage = {
      width: vi.fn(() => 1920),
      height: vi.fn(() => 1080)
    }

    const mockLayer = {
      add: vi.fn(),
      batchDraw: vi.fn()
    }

    const gridManager = new GridManager(mockStage, mockLayer)
    
    expect(typeof gridManager.getGridSize).toBe('function')
    expect(typeof gridManager.updateGridSize).toBe('function')
    expect(typeof gridManager.snapToGrid).toBe('function')
    expect(typeof gridManager.snapPointToGrid).toBe('function')
    expect(typeof gridManager.drawGrid).toBe('function')
  })
})
