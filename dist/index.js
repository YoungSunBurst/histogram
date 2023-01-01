const defaultConfig = {
    backgroundColor: "white",
    barColor: "",
    padding: 15,
    scaleFunction: (frame) => {
        return {
            scale: frame / 60,
            done: frame >= 60,
        };
    },
    gridColor: "black",
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
    draw(ctx, width, height, pixelRatio) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const canvasWidth = width * pixelRatio;
        const canvasHeight = height * pixelRatio;
        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
        ctx.fillStyle = (_a = this.config_.backgroundColor) !== null && _a !== void 0 ? _a : defaultConfig.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        let frame = 1;
        const padding = (_b = this.config_.padding) !== null && _b !== void 0 ? _b : defaultConfig.padding;
        const xStart = ((_d = (_c = this.config_.yGrid) === null || _c === void 0 ? void 0 : _c.boundSize) !== null && _d !== void 0 ? _d : 0) + padding;
        const yStart = padding;
        const graphHeight = canvasHeight - ((_f = (_e = this.config_.xGrid) === null || _e === void 0 ? void 0 : _e.boundSize) !== null && _f !== void 0 ? _f : 0) - padding * 2;
        const graphWidth = canvasWidth - xStart - padding;
        const scaleFunc = (_g = this.config_.scaleFunction) !== null && _g !== void 0 ? _g : defaultConfig.scaleFunction;
        if (this.config_.xGrid) {
            ctx.save();
            ctx.translate(xStart, yStart + graphHeight);
            const gridValueSize = (this.config_.xAxis.max - this.config_.xAxis.min) / (this.config_.xGrid.gridCount - 1);
            const values = Array(this.config_.xGrid.gridCount).fill(1).map((v, i) => this.config_.xAxis.min + i * gridValueSize);
            this.drawGrid(ctx, this.config_.xGrid, graphWidth, (_h = this.config_.gridColor) !== null && _h !== void 0 ? _h : defaultConfig.gridColor, values, 0 /* TextDirection.X */);
            ctx.restore();
        }
        if (this.config_.yGrid) {
            ctx.save();
            ctx.transform(0, -1, -1, 0, xStart, yStart + graphHeight);
            const gridValueSize = (this.config_.yAxis.max - this.config_.yAxis.min) / (this.config_.yGrid.gridCount - 1);
            const values = Array(this.config_.yGrid.gridCount).fill(1).map((v, i) => this.config_.yAxis.min + i * gridValueSize);
            this.drawGrid(ctx, this.config_.yGrid, graphHeight, (_j = this.config_.gridColor) !== null && _j !== void 0 ? _j : defaultConfig.gridColor, values, 2 /* TextDirection.YRotate */);
            ctx.restore();
        }
        const drawWithTransition = () => {
            var _a;
            ctx.save();
            ctx.fillStyle = (_a = this.config_.backgroundColor) !== null && _a !== void 0 ? _a : defaultConfig.backgroundColor;
            ctx.fillRect(xStart, yStart, graphWidth, graphHeight);
            ctx.translate(xStart, yStart);
            const { scale, done } = scaleFunc(frame++);
            const xCount = (this.config_.xAxis.max - this.config_.xAxis.min + 1) / this.config_.xInterval;
            const xBarWidth = graphWidth / xCount;
            this.tables_.forEach(table => {
                var _a, _b, _c, _d;
                const yMin = (_b = (_a = table.yAxis) === null || _a === void 0 ? void 0 : _a.min) !== null && _b !== void 0 ? _b : this.config_.yAxis.min;
                const yMax = (_d = (_c = table.yAxis) === null || _c === void 0 ? void 0 : _c.max) !== null && _d !== void 0 ? _d : this.config_.yAxis.max;
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
    drawTable(table, ctx, xBarWidth, height, yMin, yScale) {
        var _a, _b;
        ctx.fillStyle = (_a = table.fillColor) !== null && _a !== void 0 ? _a : defaultConfig.barColor;
        ctx.strokeStyle = (_b = table.strokeColor) !== null && _b !== void 0 ? _b : defaultConfig.barColor;
        for (let x = this.config_.xAxis.min, i = 0; x < this.config_.xAxis.max; x += this.config_.xInterval, i++) {
            if (table.bars[x]) {
                const pos = i * xBarWidth;
                const h = ((table.bars[x] - yMin) * yScale);
                ctx.fillRect(pos, height - h, xBarWidth, h);
                ctx.strokeRect(pos, height - h, xBarWidth, h);
            }
        }
    }
    drawGrid(ctx, gridConfig, width, color, values, textDirection) {
        var _a, _b;
        const gridSize = width / (gridConfig.gridCount - 1);
        const smallGridSize = width / (gridConfig.smallGridCount - 1);
        ctx.save();
        const fontSize = (_a = this.config_.fontSize) !== null && _a !== void 0 ? _a : 10;
        ctx.font = `${fontSize}px ${(_b = this.config_.fontFamily) !== null && _b !== void 0 ? _b : "sans-serif"}`;
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
            if (textDirection === 0 /* TextDirection.X */) {
                ctx.transform(1, 0, 0, 1, pos - textMetrics.width / 2, 20 + fontSize);
            }
            else if (textDirection === 1 /* TextDirection.Y */) {
                ctx.transform(-1, 0, 0, 1, pos + textMetrics.width / 2, 20 + fontSize);
            }
            else if (textDirection === 2 /* TextDirection.YRotate */) {
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
