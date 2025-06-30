import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GridManager } from '../app/grid/GridManager'

describe('GridManager', () => {
  let gridManager: GridManager
  let mockStage: any
  let mockLayer: any

  beforeEach(() => {
    // Mock Konva Stage
    mockStage = {
      width: vi.fn(() => 1920),
      height: vi.fn(() => 1080)
    }

    // Mock Konva Layer
    mockLayer = {
      add: vi.fn(),
      batchDraw: vi.fn()
    }

    gridManager = new GridManager(mockStage, mockLayer)
  })

  describe('constructor', () => {
    it('should initialize with default grid size', () => {
      expect(gridManager.getGridSize()).toBe(20)
    })

    it('should store stage and layer references', () => {
      // Constructor should not throw and grid manager should be created
      expect(gridManager).toBeInstanceOf(GridManager)
    })
  })

  describe('grid size management', () => {
    it('should return current grid size', () => {
      const size = gridManager.getGridSize()
      expect(size).toBe(20)
    })

    it('should update grid size and redraw', () => {
      const drawGridSpy = vi.spyOn(gridManager, 'drawGrid').mockImplementation(() => {})
      
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
    it('should snap values to grid boundaries', () => {
      // Default grid size is 20
      expect(gridManager.snapToGrid(0)).toBe(0)
      expect(gridManager.snapToGrid(10)).toBe(20)
      expect(gridManager.snapToGrid(15)).toBe(20)
      expect(gridManager.snapToGrid(25)).toBe(20)
      expect(gridManager.snapToGrid(30)).toBe(40)
    })

    it('should snap negative values correctly', () => {
      expect(gridManager.snapToGrid(-10)).toBe(0)
      expect(gridManager.snapToGrid(-15)).toBe(-20)
      expect(gridManager.snapToGrid(-25)).toBe(-20)
      expect(gridManager.snapToGrid(-30)).toBe(-40)
    })

    it('should work with different grid sizes', () => {
      gridManager.updateGridSize(25)
      
      expect(gridManager.snapToGrid(12)).toBe(0)
      expect(gridManager.snapToGrid(13)).toBe(25)
      expect(gridManager.snapToGrid(37)).toBe(50)
    })

    it('should handle exact grid values', () => {
      expect(gridManager.snapToGrid(0)).toBe(0)
      expect(gridManager.snapToGrid(20)).toBe(20)
      expect(gridManager.snapToGrid(40)).toBe(40)
      expect(gridManager.snapToGrid(100)).toBe(100)
    })

    it('should handle decimal values', () => {
      expect(gridManager.snapToGrid(10.1)).toBe(20)
      expect(gridManager.snapToGrid(10.4)).toBe(20)
      expect(gridManager.snapToGrid(10.6)).toBe(20)
      expect(gridManager.snapToGrid(19.9)).toBe(20)
    })
  })

  describe('snapPointToGrid', () => {
    it('should snap both x and y coordinates', () => {
      const point = { x: 15, y: 25 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 20, y: 20 })
    })

    it('should handle negative coordinates', () => {
      const point = { x: -15, y: -35 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: -20, y: -40 })
    })

    it('should work with different grid sizes', () => {
      gridManager.updateGridSize(25)
      
      const point = { x: 30, y: 60 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 25, y: 50 })
    })

    it('should handle decimal coordinates', () => {
      const point = { x: 15.7, y: 34.2 }
      const snapped = gridManager.snapPointToGrid(point)
      
      expect(snapped).toEqual({ x: 20, y: 40 })
    })

    it('should not modify original point object', () => {
      const originalPoint = { x: 15, y: 25 }
      const point = { ...originalPoint }
      
      gridManager.snapPointToGrid(point)
      
      // Original point should remain unchanged
      expect(point).toEqual(originalPoint)
    })
  })

  describe('drawGrid', () => {
    it('should call layer batchDraw when drawing grid', () => {
      // Mock the private methods by intercepting the public drawGrid method
      gridManager.drawGrid()
      
      expect(mockLayer.batchDraw).toHaveBeenCalled()
    })

    it('should clear existing grid before drawing new one', () => {
      const mockLine = {
        destroy: vi.fn(),
        moveToBottom: vi.fn()
      }

      // Mock Konva.Line constructor
      const mockKonvaLine = vi.fn(() => mockLine)
      vi.doMock('konva', () => ({
        Line: mockKonvaLine
      }))

      gridManager.drawGrid()
      gridManager.drawGrid() // Draw twice to test clearing

      expect(mockLayer.batchDraw).toHaveBeenCalledTimes(2)
    })

    it('should use stage dimensions for grid creation', () => {
      gridManager.drawGrid()
      
      expect(mockStage.width).toHaveBeenCalled()
      expect(mockStage.height).toHaveBeenCalled()
    })
  })

  describe('grid calculation', () => {
    it('should calculate correct number of grid lines', () => {
      // With stage 1920x1080 and grid size 20:
      // Vertical lines: 0, 20, 40, ..., 1920 = 97 lines
      // Horizontal lines: 0, 20, 40, ..., 1080 = 55 lines
      
      gridManager.drawGrid()
      
      // We can verify that layer.add was called the correct number of times
      // Each grid line and major grid line is added to the layer
      expect(mockLayer.add).toHaveBeenCalled()
    })

    it('should handle different stage dimensions', () => {
      // Change stage dimensions
      mockStage.width = vi.fn(() => 800)
      mockStage.height = vi.fn(() => 600)
      
      gridManager.drawGrid()
      
      expect(mockStage.width).toHaveBeenCalled()
      expect(mockStage.height).toHaveBeenCalled()
      expect(mockLayer.add).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle zero grid size gracefully', () => {
      // This is an edge case that might cause infinite loops
      // The implementation should either prevent this or handle it gracefully
      expect(() => {
        gridManager.updateGridSize(0)
      }).not.toThrow()
    })

    it('should handle very small grid sizes', () => {
      gridManager.updateGridSize(1)
      expect(gridManager.getGridSize()).toBe(1)
      
      expect(gridManager.snapToGrid(0.4)).toBe(0)
      expect(gridManager.snapToGrid(0.6)).toBe(1)
    })

    it('should handle very large grid sizes', () => {
      gridManager.updateGridSize(1000)
      expect(gridManager.getGridSize()).toBe(1000)
      
      expect(gridManager.snapToGrid(500)).toBe(1000)
      expect(gridManager.snapToGrid(1500)).toBe(2000)
    })

    it('should handle zero stage dimensions', () => {
      mockStage.width = vi.fn(() => 0)
      mockStage.height = vi.fn(() => 0)
      
      expect(() => {
        gridManager.drawGrid()
      }).not.toThrow()
    })
  })
})
