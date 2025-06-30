import Konva from 'konva';

export class GridManager {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private gridSize = 20;
  private majorGridSize = 100;
  private gridLines: Konva.Line[] = [];
  private majorGridLines: Konva.Line[] = [];

  constructor(stage: Konva.Stage, layer: Konva.Layer) {
    this.stage = stage;
    this.layer = layer;
  }

  public drawGrid(): void {
    this.clearGrid();
    this.createGridLines();
    this.layer.batchDraw();
  }

  private clearGrid(): void {
    // Remove existing grid lines
    this.gridLines.forEach(line => line.destroy());
    this.majorGridLines.forEach(line => line.destroy());
    this.gridLines = [];
    this.majorGridLines = [];
  }

  private createGridLines(): void {
    const width = this.stage.width();
    const height = this.stage.height();

    // Create vertical lines
    for (let x = 0; x <= width; x += this.gridSize) {
      const isMajor = x % this.majorGridSize === 0;
      const line = new Konva.Line({
        points: [x, 0, x, height],
        stroke: isMajor ? '#a0a0a0' : '#d0d0d0',
        strokeWidth: isMajor ? 1 : 0.5,
        listening: false,
      });

      if (isMajor) {
        this.majorGridLines.push(line);
      } else {
        this.gridLines.push(line);
      }
      
      this.layer.add(line);
    }

    // Create horizontal lines
    for (let y = 0; y <= height; y += this.gridSize) {
      const isMajor = y % this.majorGridSize === 0;
      const line = new Konva.Line({
        points: [0, y, width, y],
        stroke: isMajor ? '#a0a0a0' : '#d0d0d0',
        strokeWidth: isMajor ? 1 : 0.5,
        listening: false,
      });

      if (isMajor) {
        this.majorGridLines.push(line);
      } else {
        this.gridLines.push(line);
      }
      
      this.layer.add(line);
    }

    // Send grid to back
    this.gridLines.forEach(line => line.moveToBottom());
    this.majorGridLines.forEach(line => line.moveToBottom());
  }

  public updateGridSize(size: number): void {
    this.gridSize = size;
    this.drawGrid();
  }

  public getGridSize(): number {
    return this.gridSize;
  }

  public snapToGrid(value: number): number {
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  public snapPointToGrid(point: { x: number; y: number }): { x: number; y: number } {
    return {
      x: this.snapToGrid(point.x),
      y: this.snapToGrid(point.y)
    };
  }
}
