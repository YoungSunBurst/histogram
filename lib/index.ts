interface DistributionData {
    min: number;
    interval: number;
    distribution: number[];
}

interface Table {
    strokeColor?: string;
    fillColor?: string;
    data: DistributionData;
    yAxis?: Ranges;
}

export interface Grid {
    boundSize: number;
    gridCount: number;
    smallGridCount: number;
}

export interface Ranges {
    min: number;
    max: number;
}

export interface Config {
    xAxis: Ranges;
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
            scale: frame / 30,
            done: frame >= 30,
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

    constructor(tables: Table[], config: Config) {
        this.tables_ = tables;
        this.config_ = config;
    }
    //
    // private makeDistributionData(table: Table) {
    //     if (Array.isArray(table.data) && table.data.length > 0) {
    //         let min = Infinity;
    //         let max = -Infinity;
    //
    //         table.data.sort();
    //         table.data.forEach(v => {
    //             min = Math.min(min, v);
    //             max = Math.max(max, v);
    //         });
    //         const binWidth = (max - min + smallestDifference) / table.data.length;
    //         table.data.forEach(v => {
    //             let index = Math.floor((v - min) / binWidth);
    //
    //         });
    //         const distributionData: DistributionData = {
    //             min,
    //             binWidth,
    //             distribution:
    //         }
    //     }
    // }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number, pixelRatio: number) {
        const canvasWidth = width * pixelRatio;
        const canvasHeight = height * pixelRatio;
        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        ctx.fillStyle = this.config_.backgroundColor ?? defaultConfig.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        let frame = 1;
        const padding = this.config_.padding ?? defaultConfig.padding;
        const xStart = (this.config_.yGrid?.boundSize ?? 0) + padding;
        const yStart = padding;
        const graphHeight = height - (this.config_.xGrid?.boundSize ?? 0) - padding * 2;
        const graphWidth = width - xStart - padding;
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
        ctx.restore();
        const drawWithTransition = () => {
            ctx.save();
            ctx.scale(pixelRatio, pixelRatio);
            ctx.fillStyle = this.config_.backgroundColor ?? defaultConfig.backgroundColor;
            ctx.fillRect(xStart, yStart, graphWidth, graphHeight);
            ctx.translate(xStart, yStart);
            const {scale, done} = scaleFunc(frame++);
            const valuePerPixel = (this.config_.xAxis.max - this.config_.xAxis.min + 1) / graphWidth;
            this.tables_.forEach(table => {
                const yMin = table.yAxis?.min ?? this.config_.yAxis.min;
                const yMax = table.yAxis?.max ?? this.config_.yAxis.max;
                const yScale = graphHeight / (yMax - yMin + 1) * scale;
                this.drawTable(table, ctx, valuePerPixel, graphWidth, graphHeight, yMin, yScale);
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

    private drawTable(table: Table, ctx: CanvasRenderingContext2D, valuePerPixel: number, width: number, height: number, yMin: number, yScale: number) {
        ctx.fillStyle = table.fillColor ?? defaultConfig.barColor;
        ctx.strokeStyle = table.strokeColor ?? defaultConfig.barColor;
        const binWidth = table.data.interval / valuePerPixel;
        console.log(binWidth, valuePerPixel);

        table.data.distribution.forEach((v, i) => {
            if (v <= 0) return;
            const h = ((table.data.distribution[i] - yMin) * yScale);
            let x = ((table.data.min + table.data.interval * i) - this.config_.xAxis.min) / valuePerPixel;
            let right = x + binWidth;
            if (right < 0) {
                return;
            } else if (x < 0 && right > 0) {
                x = 0;
            } else if (x < width && right > width) {
                right = width;
            } else if (x > width) {
                return;
            }
            ctx.fillRect(x, height - h, right - x, h);
            ctx.strokeRect(x, height - h, right - x, h);
        });
        // for (let x = this.config_.xAxis.min, i = 0; x < this.config_.xAxis.max; x += this.config_.xInterval, i++) {
        //     const index = (x - this.config_.xMin) / this.config_.xInterval;
        //     if (index >= 0 && table.data.length > index) {
        //         const pos = i * xBarWidth;
        //         ctx.fillRect(pos, height - h, xBarWidth, h);
        //         ctx.strokeRect(pos, height - h, xBarWidth, h);
        //     }
        // }
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridConfig: Grid, width: number, color: string, values: number[], textDirection: TextDirection) {
        const gridSize = width / (gridConfig.gridCount - 1);
        const smallGridSize = width / (gridConfig.smallGridCount - 1);
        ctx.save();
        const fontSize = this.config_.fontSize ?? 10;
        ctx.font = `${fontSize}px ${this.config_.fontFamily ?? "Roboto"}`;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(0, 6);
        ctx.lineTo(width, 6);
        let pos = 0;
        for (let i = 0; i < gridConfig.gridCount; i++) {
            ctx.moveTo(pos, 6);
            ctx.lineTo(pos, 14);
            const text = (Math.round(values[i] * 10) / 10).toString();
            const textMetrics = ctx.measureText(text);
            ctx.save();
            if (textDirection === TextDirection.X) {
                ctx.transform(1, 0, 0, 1, pos - textMetrics.width / 2, 16 + fontSize);
            } else if (textDirection === TextDirection.Y) {
                ctx.transform(-1, 0, 0, 1, pos + textMetrics.width / 2, 16 + fontSize);
            } else if (textDirection === TextDirection.YRotate) {
                ctx.transform(0, -1, -1, 0, pos - fontSize / 3, 21 + textMetrics.width);
            }
            ctx.fillText(text, 0, 0);
            ctx.restore();
            pos += gridSize;
        }
        pos = 0;
        for (let i = 0; i < gridConfig.smallGridCount; i++) {
            ctx.moveTo(pos, 6);
            ctx.lineTo(pos, 10);
            pos += smallGridSize;
        }
        ctx.stroke();
        ctx.restore();
    }
}