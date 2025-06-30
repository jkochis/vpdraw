import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ViewportManager } from '../app/viewport/ViewportManager'

describe('ViewportManager', () => {
  let viewportManager: ViewportManager

  beforeEach(() => {
    viewportManager = new ViewportManager()
    // Reset window dimensions to known values
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
  })

  describe('getViewportDimensions', () => {
    it('should return current window dimensions and calculated viewport units', () => {
      const dimensions = viewportManager.getViewportDimensions()
      
      expect(dimensions).toEqual({
        width: 1920,
        height: 1080,
        vw: 19.2, // 1920 / 100
        vh: 10.8  // 1080 / 100
      })
    })

    it('should update when window is resized', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
      
      const dimensions = viewportManager.getViewportDimensions()
      
      expect(dimensions).toEqual({
        width: 1024,
        height: 768,
        vw: 10.24,
        vh: 7.68
      })
    })
  })

  describe('canvas dimensions', () => {
    it('should return default canvas dimensions', () => {
      const dimensions = viewportManager.getCanvasDimensions()
      
      expect(dimensions).toEqual({
        width: 1920,
        height: 1080
      })
    })

    it('should update canvas dimensions', () => {
      viewportManager.setCanvasDimensions(1024, 768)
      const dimensions = viewportManager.getCanvasDimensions()
      
      expect(dimensions).toEqual({
        width: 1024,
        height: 768
      })
    })
  })

  describe('pixelsToViewportUnits', () => {
    beforeEach(() => {
      viewportManager.setCanvasDimensions(1920, 1080)
    })

    it('should convert pixels to vw units for width dimension', () => {
      const result = viewportManager.pixelsToViewportUnits(192, 'width')
      
      expect(result).toEqual({
        value: 10,
        unit: 'vw'
      })
    })

    it('should convert pixels to vh units for height dimension', () => {
      const result = viewportManager.pixelsToViewportUnits(108, 'height')
      
      expect(result).toEqual({
        value: 10,
        unit: 'vh'
      })
    })

    it('should round to 2 decimal places', () => {
      const result = viewportManager.pixelsToViewportUnits(100, 'width')
      // 100 / (1920/100) = 5.208333... should round to 5.21
      expect(result.value).toBe(5.21)
    })

    it('should handle different canvas dimensions', () => {
      viewportManager.setCanvasDimensions(1000, 600)
      
      const widthResult = viewportManager.pixelsToViewportUnits(100, 'width')
      const heightResult = viewportManager.pixelsToViewportUnits(60, 'height')
      
      expect(widthResult.value).toBe(10)
      expect(heightResult.value).toBe(10)
    })
  })

  describe('viewportUnitsToPixels', () => {
    beforeEach(() => {
      viewportManager.setCanvasDimensions(1920, 1080)
    })

    it('should convert vw units to pixels', () => {
      const result = viewportManager.viewportUnitsToPixels(10, 'vw')
      expect(result).toBe(192) // 10% of 1920
    })

    it('should convert vh units to pixels', () => {
      const result = viewportManager.viewportUnitsToPixels(10, 'vh')
      expect(result).toBe(108) // 10% of 1080
    })

    it('should convert vmin units to pixels', () => {
      const result = viewportManager.viewportUnitsToPixels(10, 'vmin')
      expect(result).toBe(108) // 10% of min(1920, 1080) = 10% of 1080
    })

    it('should convert vmax units to pixels', () => {
      const result = viewportManager.viewportUnitsToPixels(10, 'vmax')
      expect(result).toBe(192) // 10% of max(1920, 1080) = 10% of 1920
    })

    it('should handle square canvas for vmin/vmax', () => {
      viewportManager.setCanvasDimensions(1000, 1000)
      
      const vminResult = viewportManager.viewportUnitsToPixels(10, 'vmin')
      const vmaxResult = viewportManager.viewportUnitsToPixels(10, 'vmax')
      
      expect(vminResult).toBe(100)
      expect(vmaxResult).toBe(100)
    })
  })

  describe('formatViewportUnit', () => {
    beforeEach(() => {
      viewportManager.setCanvasDimensions(1920, 1080)
    })

    it('should format viewport unit with correct suffix', () => {
      const widthResult = viewportManager.formatViewportUnit(192, 'width')
      const heightResult = viewportManager.formatViewportUnit(108, 'height')
      
      expect(widthResult).toBe('10vw')
      expect(heightResult).toBe('10vh')
    })

    it('should handle decimal values', () => {
      const result = viewportManager.formatViewportUnit(100, 'width')
      expect(result).toBe('5.21vw')
    })
  })

  describe('getResponsiveCSS', () => {
    beforeEach(() => {
      viewportManager.setCanvasDimensions(1920, 1080)
    })

    it('should generate CSS with viewport units', () => {
      const css = viewportManager.getResponsiveCSS(192, 108, 384, 216)
      
      expect(css).toBe(`
  position: absolute;
  left: 10vw;
  top: 10vh;
  width: 20vw;
  height: 20vh;`)
    })

    it('should handle zero values', () => {
      const css = viewportManager.getResponsiveCSS(0, 0, 100, 50)
      
      expect(css).toBe(`
  position: absolute;
  left: 0vw;
  top: 0vh;
  width: 5.21vw;
  height: 4.63vh;`)
    })
  })

  describe('base resolution', () => {
    it('should return default base resolution', () => {
      const baseResolution = viewportManager.getBaseResolution()
      
      expect(baseResolution).toEqual({
        width: 1920,
        height: 1080
      })
    })

    it('should update base resolution', () => {
      viewportManager.setBaseResolution(1440, 900)
      const baseResolution = viewportManager.getBaseResolution()
      
      expect(baseResolution).toEqual({
        width: 1440,
        height: 900
      })
    })
  })
})
