export type Bar = { [key: number]: number };

export interface Table {
    strokeColor?: string;
    fillColor?: string;
    bars: Bar;
    yAxis?: Ranges;
}

export interface Grid {
    //
    boundSize: number;
    gridCount: number;
    smallGridCount: number;
    // displayValues: number[];
}

export interface Ranges {
    min: number;
    max: number;
}

export interface Config {
    xAxis: Ranges;
    xInterval: number;
    yAxis: Ranges;
    xGrid?: Grid;
    yGrid?: Grid;
    gridColor?: string;
    scaleFunction?: (frame: number) => { scale: number, done: boolean };
    fontFamily?: string;
    fontSize?: number;
    padding?: number;
    backgroundColor?: string;
}

const defaultConfig = {
    backgroundColor: "white",
    barColor: "",
    padding: 15,
    scaleFunction: (frame: number) => {
        return {
            scale: frame / 60,
            done: frame >= 60,
        };
    },
    gridColor: "black",
};

const enum TextDirection {
    X,
    Y,
    YRotate
}

export class MultiHistogram {
    private tables_: Table[] = [];
    private config_: Config;

    constructor(table: Table[], config: Config) {
        this.tables_ = table;
        this.config_ = config;
    }

    public setValue(table: Table[]): void {
        this.tables_ = table;
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number, pixelRatio: number) {
        const canvasWidth = width * pixelRatio;
        const canvasHeight = height * pixelRatio;
        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
        ctx.fillStyle = this.config_.backgroundColor ?? defaultConfig.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        let frame = 1;
        const padding = this.config_.padding ?? defaultConfig.padding;
        const xStart = (this.config_.yGrid?.boundSize ?? 0) + padding;
        const yStart = padding;
        const graphHeight = canvasHeight - (this.config_.xGrid?.boundSize ?? 0) - padding * 2;
        const graphWidth = canvasWidth - xStart - padding;
        const scaleFunc = this.config_.scaleFunction ?? defaultConfig.scaleFunction;
        if (this.config_.xGrid) {
            ctx.save();
            ctx.translate(xStart, yStart + graphHeight);
            const gridValueSize = (this.config_.xAxis.max - this.config_.xAxis.min) / (this.config_.xGrid.gridCount - 1);
            const values = Array(this.config_.xGrid.gridCount).fill(1).map((v, i) => this.config_.xAxis.min + i * gridValueSize);
            this.drawGrid(ctx, this.config_.xGrid, graphWidth, this.config_.gridColor ?? defaultConfig.gridColor, values, TextDirection.X);
            ctx.restore();
        }
        if (this.config_.yGrid) {
            ctx.save();
            ctx.transform(0, -1, -1, 0, xStart, yStart + graphHeight);
            const gridValueSize = (this.config_.yAxis.max - this.config_.yAxis.min) / (this.config_.yGrid.gridCount - 1);
            const values = Array(this.config_.yGrid.gridCount).fill(1).map((v, i) => this.config_.yAxis.min + i * gridValueSize);
            this.drawGrid(ctx, this.config_.yGrid, graphHeight, this.config_.gridColor ?? defaultConfig.gridColor, values, TextDirection.YRotate);
            ctx.restore();
        }
        const drawWithTransition = () => {
            ctx.save();
            ctx.fillStyle = this.config_.backgroundColor ?? defaultConfig.backgroundColor;
            ctx.fillRect(xStart, yStart, graphWidth, graphHeight);
            ctx.translate(xStart, yStart);
            const {scale, done} = scaleFunc(frame++);
            const xCount = (this.config_.xAxis.max - this.config_.xAxis.min + 1) / this.config_.xInterval;
            const xBarWidth = graphWidth / xCount;
            this.tables_.forEach(table => {
                const yMin = table.yAxis?.min ?? this.config_.yAxis.min;
                const yMax = table.yAxis?.max ?? this.config_.yAxis.max;
                const yScale = graphHeight / (yMax - yMin + 1) * scale;
                this.drawTable(table, ctx, xBarWidth, graphHeight, yMin, yScale);
            });
            ctx.restore();
            if (!done) {
                requestAnimationFrame(() => {
                    drawWithTransition();
                });
            }
        };
        drawWithTransition();
    }

    private drawTable(table: Table, ctx: CanvasRenderingContext2D, xBarWidth: number, height: number, yMin: number, yScale: number) {
        ctx.fillStyle = table.fillColor ?? defaultConfig.barColor;
        ctx.strokeStyle = table.strokeColor ?? defaultConfig.barColor;
        for (let x = this.config_.xAxis.min, i = 0; x < this.config_.xAxis.max; x += this.config_.xInterval, i++) {
            if (table.bars[x]) {
                const pos = i * xBarWidth;
                const h = ((table.bars[x] - yMin) * yScale);
                ctx.fillRect(pos, height - h, xBarWidth, h);
                ctx.strokeRect(pos, height - h, xBarWidth, h);
            }
        }
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridConfig: Grid, width: number, color: string, values: number[], textDirection: TextDirection) {
        const gridSize = width / (gridConfig.gridCount - 1);
        const smallGridSize = width / (gridConfig.smallGridCount - 1);
        ctx.save();
        const fontSize = this.config_.fontSize ?? 10;
        ctx.font = `${fontSize}px ${this.config_.fontFamily ?? "sans-serif"}`;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(0, 10);
        ctx.lineTo(width, 10);
        let pos = 0;
        for (let i = 0; i < gridConfig.gridCount; i++) {
            ctx.moveTo(pos, 10);
            ctx.lineTo(pos, 20);
            const textMetrics = ctx.measureText(values[i].toString());
            ctx.save();
            if (textDirection === TextDirection.X) {
                ctx.transform(1, 0, 0, 1, pos - textMetrics.width / 2, 20 + fontSize);
            } else if (textDirection === TextDirection.Y) {
                ctx.transform(-1, 0, 0, 1, pos + textMetrics.width / 2, 20 + fontSize);
            } else if (textDirection === TextDirection.YRotate) {
                ctx.transform(0, -1, -1, 0, pos - fontSize / 3, 25 + textMetrics.width);
            }
            ctx.fillText(values[i].toString(), 0, 0);
            ctx.restore();
            pos += gridSize;
        }
        pos = 0;
        for (let i = 0; i < gridConfig.smallGridCount; i++) {
            ctx.moveTo(pos, 10);
            ctx.lineTo(pos, 15);
            pos += smallGridSize;
        }
        ctx.stroke();
        ctx.restore();
    }
}