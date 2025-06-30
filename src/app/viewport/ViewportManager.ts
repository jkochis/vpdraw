export interface ViewportDimensions {
  width: number;
  height: number;
  vw: number;
  vh: number;
}

export interface ViewportUnit {
  value: number;
  unit: 'vw' | 'vh' | 'vmin' | 'vmax';
}

export class ViewportManager {
  private baseWidth = 1920;
  private baseHeight = 1080;
  private canvasWidth = 1920;
  private canvasHeight = 1080;

  public getViewportDimensions(): ViewportDimensions {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      vw: width / 100,
      vh: height / 100,
    };
  }

  public getCanvasDimensions(): { width: number; height: number } {
    return {
      width: this.canvasWidth,
      height: this.canvasHeight
    };
  }

  public setCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public pixelsToViewportUnits(pixels: number, dimension: 'width' | 'height'): ViewportUnit {
    // Use canvas dimensions as the base for viewport unit calculations
    const canvasVW = this.canvasWidth / 100;
    const canvasVH = this.canvasHeight / 100;
    
    if (dimension === 'width') {
      return {
        value: Math.round((pixels / canvasVW) * 100) / 100,
        unit: 'vw'
      };
    } else {
      return {
        value: Math.round((pixels / canvasVH) * 100) / 100,
        unit: 'vh'
      };
    }
  }

  public viewportUnitsToPixels(value: number, unit: 'vw' | 'vh' | 'vmin' | 'vmax'): number {
    const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions();
    
    switch (unit) {
      case 'vw':
        return (value / 100) * canvasWidth;
      case 'vh':
        return (value / 100) * canvasHeight;
      case 'vmin':
        return (value / 100) * Math.min(canvasWidth, canvasHeight);
      case 'vmax':
        return (value / 100) * Math.max(canvasWidth, canvasHeight);
      default:
        return value;
    }
  }

  public formatViewportUnit(pixels: number, dimension: 'width' | 'height'): string {
    const unit = this.pixelsToViewportUnits(pixels, dimension);
    return `${unit.value}${unit.unit}`;
  }

  public getResponsiveCSS(x: number, y: number, width: number, height: number): string {
    const leftVW = this.formatViewportUnit(x, 'width');
    const topVH = this.formatViewportUnit(y, 'height');
    const widthVW = this.formatViewportUnit(width, 'width');
    const heightVH = this.formatViewportUnit(height, 'height');

    return `
  position: absolute;
  left: ${leftVW};
  top: ${topVH};
  width: ${widthVW};
  height: ${heightVH};`;
  }

  public setBaseResolution(width: number, height: number): void {
    this.baseWidth = width;
    this.baseHeight = height;
  }

  public getBaseResolution(): { width: number; height: number } {
    return {
      width: this.baseWidth,
      height: this.baseHeight
    };
  }
}
