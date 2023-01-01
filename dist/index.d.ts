export type Bar = {
    [key: number]: number;
};
export interface Table {
    strokeColor?: string;
    fillColor?: string;
    bars: Bar;
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
    xInterval: number;
    yAxis: Ranges;
    xGrid?: Grid;
    yGrid?: Grid;
    gridColor?: string;
    scaleFunction?: (frame: number) => {
        scale: number;
        done: boolean;
    };
    fontFamily?: string;
    fontSize?: number;
    padding?: number;
    backgroundColor?: string;
}
export declare class MultiHistogram {
    private tables_;
    private config_;
    constructor(table: Table[], config: Config);
    setValue(table: Table[]): void;
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, pixelRatio: number): void;
    private drawTable;
    private drawGrid;
}
