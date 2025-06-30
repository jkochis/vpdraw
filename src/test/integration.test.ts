import { describe, it, expect, vi } from 'vitest'

/**
 * Integration tests to verify the overall application flow
 * These tests focus on the interaction between different components
 */
describe('VPDraw Integration', () => {
  describe('Component Integration', () => {
    it('should be able to import core managers without errors', async () => {
      // Test that all core modules can be imported
      expect(async () => {
        await import('../app/viewport/ViewportManager')
        await import('../app/viewport/ViewportPresets')
        await import('../app/grid/GridManager')
        await import('../app/export/CSSExporter')
      }).not.toThrow()
    })

    it('should handle viewport unit calculations correctly', async () => {
      const { ViewportManager } = await import('../app/viewport/ViewportManager')
      const manager = new ViewportManager()
      
      // Set known canvas dimensions
      manager.setCanvasDimensions(1920, 1080)
      
      // Test pixel to viewport unit conversion
      const vwResult = manager.pixelsToViewportUnits(192, 'width')
      const vhResult = manager.pixelsToViewportUnits(108, 'height')
      
      expect(vwResult.value).toBe(10)
      expect(vwResult.unit).toBe('vw')
      expect(vhResult.value).toBe(10)
      expect(vhResult.unit).toBe('vh')
    })

    it('should handle viewport preset scaling calculations', async () => {
      const { ViewportPresets } = await import('../app/viewport/ViewportPresets')
      
      // Test proportional scaling
      const scaleFactors = ViewportPresets.calculateScaleFactors(1920, 1080, 960, 540)
      expect(scaleFactors.scaleX).toBe(0.5)
      expect(scaleFactors.scaleY).toBe(0.5)
      
      // Test element scaling
      const element = { x: 100, y: 100, width: 200, height: 100, fontSize: 16 }
      const scaled = ViewportPresets.scaleElementProperties(element, 0.5, 0.5)
      
      expect(scaled.x).toBe(50)
      expect(scaled.y).toBe(50) 
      expect(scaled.width).toBe(100)
      expect(scaled.height).toBe(50)
      expect(scaled.fontSize).toBe(8) // Minimum font size enforced
    })

    it('should generate proper CSS output format', async () => {
      const { ViewportManager } = await import('../app/viewport/ViewportManager')
      const manager = new ViewportManager()
      manager.setCanvasDimensions(1920, 1080)
      
      const css = manager.getResponsiveCSS(192, 108, 384, 216)
      
      expect(css).toContain('position: absolute')
      expect(css).toContain('left: 10vw')
      expect(css).toContain('top: 10vh')
      expect(css).toContain('width: 20vw')
      expect(css).toContain('height: 20vh')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid viewport dimensions gracefully', async () => {
      const { ViewportManager } = await import('../app/viewport/ViewportManager')
      const manager = new ViewportManager()
      
      // Test with zero dimensions
      expect(() => manager.setCanvasDimensions(0, 0)).not.toThrow()
      
      // Test with negative dimensions
      expect(() => manager.setCanvasDimensions(-100, -100)).not.toThrow()
    })

    it('should handle unknown preset lookups', async () => {
      const { ViewportPresets } = await import('../app/viewport/ViewportPresets')
      
      const unknownPreset = ViewportPresets.getPresetByKey('9999x9999')
      expect(unknownPreset).toBeNull()
    })
  })

  describe('Data Consistency', () => {
    it('should maintain viewport aspect ratios during orientation changes', async () => {
      const { ViewportPresets } = await import('../app/viewport/ViewportPresets')
      const presets = new ViewportPresets()
      
      const original = { width: 1920, height: 1080 }
      const toggled = presets.toggleOrientation(original.width, original.height)
      
      // Dimensions should be swapped
      expect(toggled.width).toBe(original.height)
      expect(toggled.height).toBe(original.width)
      
      // Toggle back should return to original
      const toggledBack = presets.toggleOrientation(toggled.width, toggled.height)
      expect(toggledBack.width).toBe(original.width)
      expect(toggledBack.height).toBe(original.height)
    })

    it('should provide consistent breakpoint ordering', async () => {
      const { ViewportPresets } = await import('../app/viewport/ViewportPresets')
      
      const breakpoints = ViewportPresets.getResponsiveBreakpoints()
      
      // Verify ascending order
      for (let i = 1; i < breakpoints.length; i++) {
        expect(breakpoints[i].width).toBeGreaterThan(breakpoints[i - 1].width)
      }
    })
  })

  describe('Performance Considerations', () => {
    it('should handle multiple viewport calculations efficiently', async () => {
      const { ViewportManager } = await import('../app/viewport/ViewportManager')
      const manager = new ViewportManager()
      manager.setCanvasDimensions(1920, 1080)
      
      const start = performance.now()
      
      // Perform many calculations
      for (let i = 0; i < 1000; i++) {
        manager.pixelsToViewportUnits(i, 'width')
        manager.viewportUnitsToPixels(i / 100, 'vw')
      }
      
      const duration = performance.now() - start
      
      // Should complete calculations quickly (under 100ms for 1000 iterations)
      expect(duration).toBeLessThan(100)
    })

    it('should handle large element scaling operations', async () => {
      const { ViewportPresets } = await import('../app/viewport/ViewportPresets')
      
      const start = performance.now()
      
      // Scale many elements
      for (let i = 0; i < 1000; i++) {
        const element = { x: i, y: i, width: i + 100, height: i + 50, fontSize: 16 }
        ViewportPresets.scaleElementProperties(element, 1.5, 1.5)
      }
      
      const duration = performance.now() - start
      
      // Should complete scaling operations quickly
      expect(duration).toBeLessThan(50)
    })
  })
})
