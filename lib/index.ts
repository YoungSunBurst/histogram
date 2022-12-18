export interface Bar {
    bin: number;
    value: number;
}

export type Table = Bar[];

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
    interval: number;
}

export interface Config {
    xAxis: Ranges;
    yAxis: Ranges;
    xGrid: Grid | null;
    yGrid: Grid | null;
    barColor: string;
}

const defaultConfig = {
    barColor: "",
};

export class MultiHistogram {
    private Tables_: Table[] = [];
    private config_: Config;
    private width_: number;
    private height_: number;
    private scale_: number;
    constructor(private readonly ctx_: CanvasRenderingContext2D, width: number, height: number, scale: number, config: Partial<Config>) {
        this.config_ = this.fillConfig(config);
        this.width_ = width * scale;
        this.height_ = height * scale;
        this.scale_ = scale;
    }
    private fillConfig(config: Partial<Config>): Config {

    }

    public setValue(table: Table[]): void {

    }

    public draw() {
        // this.ctx_.setTransform()

    }

    private drawBars() {
        this.ctx_.fillStyle = this.config_.barColor ?? defaultConfig.barColor;
        for (let x = this.config_.xAxis.min; x < this.config_.xAxis.max; x += this.config_.xAxis.interval) {

        }

    }
}