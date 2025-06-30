import { describe, it, expect, beforeEach } from 'vitest'
import { ViewportPresets } from '../app/viewport/ViewportPresets'

describe('ViewportPresets', () => {
  let viewportPresets: ViewportPresets

  beforeEach(() => {
    viewportPresets = new ViewportPresets()
  })

  describe('getPresets', () => {
    it('should return an array of preset configurations', () => {
      const presets = ViewportPresets.getPresets()
      
      expect(Array.isArray(presets)).toBe(true)
      expect(presets.length).toBeGreaterThan(0)
      
      // Check structure of first preset
      const firstPreset = presets[0]
      expect(firstPreset).toHaveProperty('name')
      expect(firstPreset).toHaveProperty('width')
      expect(firstPreset).toHaveProperty('height')
      expect(firstPreset).toHaveProperty('category')
    })

    it('should include expected desktop presets', () => {
      const presets = ViewportPresets.getPresets()
      const desktopPresets = presets.filter(p => p.category === 'desktop')
      
      expect(desktopPresets).toContainEqual({
        name: "Desktop HD",
        width: 1920,
        height: 1080,
        category: "desktop"
      })
      
      expect(desktopPresets).toContainEqual({
        name: "Laptop",
        width: 1366,
        height: 768,
        category: "desktop"
      })
    })

    it('should include expected mobile presets', () => {
      const presets = ViewportPresets.getPresets()
      const mobilePresets = presets.filter(p => p.category === 'mobile')
      
      expect(mobilePresets).toContainEqual({
        name: "iPhone 11 Pro",
        width: 414,
        height: 896,
        category: "mobile"
      })
      
      expect(mobilePresets).toContainEqual({
        name: "iPhone SE",
        width: 375,
        height: 667,
        category: "mobile"
      })
    })

    it('should include expected tablet presets', () => {
      const presets = ViewportPresets.getPresets()
      const tabletPresets = presets.filter(p => p.category === 'tablet')
      
      expect(tabletPresets).toContainEqual({
        name: "iPad",
        width: 768,
        height: 1024,
        category: "tablet"
      })
    })

    it('should return a copy of presets array', () => {
      const presets1 = ViewportPresets.getPresets()
      const presets2 = ViewportPresets.getPresets()
      
      // Should be equal but not the same reference
      expect(presets1).toEqual(presets2)
      expect(presets1).not.toBe(presets2)
    })
  })

  describe('getPresetByKey', () => {
    it('should find preset by exact dimensions', () => {
      const preset = ViewportPresets.getPresetByKey('1920x1080')
      
      expect(preset).toEqual({
        name: "Desktop HD",
        width: 1920,
        height: 1080,
        category: "desktop"
      })
    })

    it('should find preset by swapped dimensions', () => {
      const preset = ViewportPresets.getPresetByKey('1080x1920')
      
      expect(preset).toEqual({
        name: "Desktop HD",
        width: 1920,
        height: 1080,
        category: "desktop"
      })
    })

    it('should return null for non-existent dimensions', () => {
      const preset = ViewportPresets.getPresetByKey('9999x9999')
      expect(preset).toBeNull()
    })

    it('should handle mobile preset dimensions', () => {
      const preset = ViewportPresets.getPresetByKey('414x896')
      
      expect(preset).toEqual({
        name: "iPhone 11 Pro",
        width: 414,
        height: 896,
        category: "mobile"
      })
    })
  })

  describe('toggleOrientation', () => {
    it('should swap width and height', () => {
      const result = viewportPresets.toggleOrientation(1920, 1080)
      
      expect(result).toEqual({
        width: 1080,
        height: 1920
      })
    })

    it('should swap back on second toggle', () => {
      viewportPresets.toggleOrientation(1920, 1080)
      const result = viewportPresets.toggleOrientation(1080, 1920)
      
      expect(result).toEqual({
        width: 1920,
        height: 1080
      })
    })

    it('should work with any dimensions', () => {
      const result = viewportPresets.toggleOrientation(375, 667)
      
      expect(result).toEqual({
        width: 667,
        height: 375
      })
    })
  })

  describe('calculateScaleFactors', () => {
    it('should calculate correct scale factors', () => {
      const factors = ViewportPresets.calculateScaleFactors(1920, 1080, 960, 540)
      
      expect(factors).toEqual({
        scaleX: 0.5,
        scaleY: 0.5
      })
    })

    it('should handle upscaling', () => {
      const factors = ViewportPresets.calculateScaleFactors(500, 300, 1000, 600)
      
      expect(factors).toEqual({
        scaleX: 2,
        scaleY: 2
      })
    })

    it('should handle different aspect ratios', () => {
      const factors = ViewportPresets.calculateScaleFactors(1920, 1080, 1080, 1920)
      
      expect(factors.scaleX).toBeCloseTo(0.5625, 4)
      expect(factors.scaleY).toBeCloseTo(1.7778, 4)
    })
  })

  describe('scaleElementProperties', () => {
    it('should scale position and size properties', () => {
      const element = { x: 100, y: 50, width: 200, height: 100 }
      const scaled = ViewportPresets.scaleElementProperties(element, 2, 1.5)
      
      expect(scaled).toEqual({
        x: 200,
        y: 75,
        width: 400,
        height: 150
      })
    })

    it('should scale font size proportionally', () => {
      const element = { x: 0, y: 0, width: 100, height: 50, fontSize: 16 }
      const scaled = ViewportPresets.scaleElementProperties(element, 2, 1)
      
      // Font size should use average scale: (2 + 1) / 2 = 1.5
      expect(scaled.fontSize).toBe(24) // 16 * 1.5
    })

    it('should enforce minimum font size', () => {
      const element = { x: 0, y: 0, width: 100, height: 50, fontSize: 16 }
      const scaled = ViewportPresets.scaleElementProperties(element, 0.1, 0.1)
      
      // Average scale: (0.1 + 0.1) / 2 = 0.1, so 16 * 0.1 = 1.6
      // Should be enforced to minimum of 8
      expect(scaled.fontSize).toBe(8)
    })

    it('should not add fontSize property if not present', () => {
      const element = { x: 100, y: 50, width: 200, height: 100 }
      const scaled = ViewportPresets.scaleElementProperties(element, 2, 1.5)
      
      expect(scaled).not.toHaveProperty('fontSize')
    })
  })

  describe('orientation helpers', () => {
    it('should identify landscape orientation', () => {
      const orientation = viewportPresets.getOrientationName(1920, 1080)
      expect(orientation).toBe('Landscape')
    })

    it('should identify portrait orientation', () => {
      const orientation = viewportPresets.getOrientationName(1080, 1920)
      expect(orientation).toBe('Portrait')
    })

    it('should handle square dimensions as portrait', () => {
      const orientation = viewportPresets.getOrientationName(1000, 1000)
      expect(orientation).toBe('Portrait')
    })

    it('should correctly identify portrait state', () => {
      expect(viewportPresets.isCurrentlyPortrait(1080, 1920)).toBe(true)
      expect(viewportPresets.isCurrentlyPortrait(1920, 1080)).toBe(false)
      expect(viewportPresets.isCurrentlyPortrait(1000, 1000)).toBe(false)
    })
  })

  describe('getPresetNameForDimensions', () => {
    it('should return preset name with orientation for known dimensions', () => {
      const name = viewportPresets.getPresetNameForDimensions(1920, 1080)
      expect(name).toBe('Desktop HD (Landscape)')
    })

    it('should return preset name with orientation for portrait mode', () => {
      const name = viewportPresets.getPresetNameForDimensions(1080, 1920)
      expect(name).toBe('Desktop HD (Portrait)')
    })

    it('should return custom name for unknown dimensions', () => {
      const name = viewportPresets.getPresetNameForDimensions(1234, 567)
      expect(name).toBe('Custom (1234×567)')
    })

    it('should handle mobile presets', () => {
      const name = viewportPresets.getPresetNameForDimensions(414, 896)
      expect(name).toBe('iPhone 11 Pro (Portrait)')
    })
  })

  describe('getResponsiveBreakpoints', () => {
    it('should return standard responsive breakpoints', () => {
      const breakpoints = ViewportPresets.getResponsiveBreakpoints()
      
      expect(breakpoints).toEqual([
        { name: "Mobile", width: 320 },
        { name: "Mobile Large", width: 375 },
        { name: "Tablet", width: 768 },
        { name: "Desktop", width: 1024 },
        { name: "Desktop Large", width: 1440 },
        { name: "Desktop XL", width: 1920 },
      ])
    })

    it('should return breakpoints in ascending order', () => {
      const breakpoints = ViewportPresets.getResponsiveBreakpoints()
      
      for (let i = 1; i < breakpoints.length; i++) {
        expect(breakpoints[i].width).toBeGreaterThan(breakpoints[i - 1].width)
      }
    })
  })
})
