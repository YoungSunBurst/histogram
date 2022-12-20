const defaultConfig = {
    barColor: "",
};
export class MultiHistogram {
    constructor(table, config) {
        this.tables_ = [];
        this.tables_ = table;
        this.config_ = config;
    }
    setValue(table) {
        this.tables_ = table;
    }
    draw(ctx, width, height, scale) {
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
    drawTable(table, ctx, xBarWidth, height, yScale) {
        var _a, _b;
        ctx.fillStyle = (_a = table.fillColor) !== null && _a !== void 0 ? _a : defaultConfig.barColor;
        ctx.strokeStyle = (_b = table.strokeColor) !== null && _b !== void 0 ? _b : defaultConfig.barColor;
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
