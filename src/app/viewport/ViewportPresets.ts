export interface ViewportPreset {
  name: string;
  width: number;
  height: number;
  category: 'desktop' | 'tablet' | 'mobile';
}

export class ViewportPresets {
  private static presets: ViewportPreset[] = [
    // Desktop
    { name: "Desktop HD", width: 1920, height: 1080, category: "desktop" },
    { name: "Desktop", width: 1440, height: 900, category: "desktop" },
    { name: "Laptop", width: 1366, height: 768, category: "desktop" },
    
    // Tablets
    { name: "iPad", width: 768, height: 1024, category: "tablet" },
    { name: "iPad Pro", width: 1024, height: 1366, category: "tablet" },
    
    // Mobile
    { name: "iPhone 11 Pro", width: 414, height: 896, category: "mobile" },
    { name: "iPhone SE", width: 375, height: 667, category: "mobile" },
    { name: "Android", width: 360, height: 640, category: "mobile" },
  ];

  private isPortrait = false;

  public static getPresets(): ViewportPreset[] {
    return [...this.presets];
  }

  public static getPresetByKey(key: string): ViewportPreset | null {
    const [widthStr, heightStr] = key.split('x');
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    
    return this.presets.find(p => 
      (p.width === width && p.height === height) ||
      (p.width === height && p.height === width)
    ) || null;
  }

  public toggleOrientation(width: number, height: number): { width: number; height: number } {
    this.isPortrait = !this.isPortrait;
    
    // Swap dimensions
    return {
      width: height,
      height: width
    };
  }

  public static calculateScaleFactors(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): { scaleX: number; scaleY: number } {
    return {
      scaleX: newWidth / oldWidth,
      scaleY: newHeight / oldHeight
    };
  }

  public static scaleElementProperties(
    element: { x: number; y: number; width: number; height: number; fontSize?: number },
    scaleX: number,
    scaleY: number
  ): { x: number; y: number; width: number; height: number; fontSize?: number } {
    const scaled = {
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY
    };

    // Scale font size for text elements proportionally (use average scale to maintain readability)
    if (element.fontSize !== undefined) {
      const avgScale = (scaleX + scaleY) / 2;
      (scaled as any).fontSize = Math.max(8, element.fontSize * avgScale); // Minimum 8px font size
    }

    return scaled;
  }

  public getOrientationName(width: number, height: number): string {
    return width > height ? 'Landscape' : 'Portrait';
  }

  public isCurrentlyPortrait(width: number, height: number): boolean {
    return height > width;
  }

  public getPresetNameForDimensions(width: number, height: number): string {
    const preset = ViewportPresets.presets.find(p => 
      (p.width === width && p.height === height) ||
      (p.width === height && p.height === width)
    );

    if (preset) {
      const orientation = this.getOrientationName(width, height);
      return `${preset.name} (${orientation})`;
    }

    return `Custom (${width}×${height})`;
  }

  public static getResponsiveBreakpoints(): { name: string; width: number }[] {
    return [
      { name: "Mobile", width: 320 },
      { name: "Mobile Large", width: 375 },
      { name: "Tablet", width: 768 },
      { name: "Desktop", width: 1024 },
      { name: "Desktop Large", width: 1440 },
      { name: "Desktop XL", width: 1920 },
    ];
  }
}
