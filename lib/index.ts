export type Bar = {[key: number]: number};

export interface Table {
    strokeColor?: string;
    fillColor?: string;
    bars: Bar;
}

export interface Grid {
    //
    boundSize: number;
    fontFamily: string;
    fontSize: number;
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
}

const defaultConfig = {
    barColor: "",
};

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

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
        ctx.canvas.width = width * scale;
        ctx.canvas.height = height * scale;
        let s = 0.1;
        const reDraw = () => {
            ctx.save();
            ctx.scale(scale, scale);
            const xCount = (this.config_.xAxis.max - this.config_.xAxis.min + 1) / this.config_.xInterval;
            const xBarWidth = width / xCount;
            const yScale = height / (this.config_.yAxis.max - this.config_.yAxis.min + 1) * s;
            console.log(this.tables_);
            this.tables_.forEach(table => {
                this.drawTable(table, ctx, xBarWidth, height, yScale);
            });
            ctx.restore();
            if (s < 1) {
                requestAnimationFrame(() => {
                    s += 0.01;
                    reDraw();
                });
            }
        };
        reDraw();
    }

    private drawTable(table: Table, ctx: CanvasRenderingContext2D, xBarWidth: number, height: number, yScale: number) {
        ctx.fillStyle = table.fillColor ?? defaultConfig.barColor;
        ctx.strokeStyle = table.strokeColor ?? defaultConfig.barColor;
        for (let x = this.config_.xAxis.min, i = 0; x < this.config_.xAxis.max; x += this.config_.xInterval, i++) {
            if (table.bars[x]) {
                const pos = i * xBarWidth;
                const h = ((table.bars[x] - this.config_.yAxis.min) * yScale);
                ctx.fillRect(pos, height - h, xBarWidth, h);
                ctx.strokeRect(pos, height - h, xBarWidth, h);
                console.log(ctx.fillStyle, pos, height - h, xBarWidth, h, table.bars[x], this.config_.yAxis.min);
            }
        }
        console.log("draw");
    }
}