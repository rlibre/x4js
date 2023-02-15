/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file canvas.ts
* @author Etienne Cochard
*
* Copyright (c) 2019-2022 R-libre ingenierie
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
* The above copyright notice and this permission notice shall be included in all copies
* or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
* PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { Component, CProps, CEventMap } from './component';
import { BasicEvent, EventCallback } from './x4events';
interface EvPaint extends BasicEvent {
    ctx: CanvasPainter;
}
declare function EvPaint(ctx: CanvasPainter): EvPaint;
interface CanvasEventMap extends CEventMap {
    paint: EvPaint;
}
interface CanvasProps extends CProps<CanvasEventMap> {
    autoClear?: boolean;
    painter?: PaintHandler;
    paint: EventCallback<EvPaint>;
}
export interface CanvasPainter extends CanvasRenderingContext2D {
    width: number;
    height: number;
    smoothLine(points: any[], path: CanvasPath, move: boolean): void;
    smoothLineEx(_points: any[], tension: number, numOfSeg: number, path: CanvasPath, move?: boolean, close?: boolean): void;
    line(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number): void;
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
    calcTextSize(text: string, rounded: boolean): {
        width: number;
        height: number;
    };
    setFontSize(fs: number): void;
    circle(x: number, y: number, radius: number): void;
}
type PaintHandler = (ctx: CanvasPainter) => any;
/**
 *
 */
/**
 * Standard Canvas
 */
export declare class Canvas extends Component<CanvasProps, CanvasEventMap> {
    private m_iwidth;
    private m_iheight;
    private m_scale;
    private m_canvas;
    constructor(props: CanvasProps);
    /** @ignore */
    render(): void;
    update(delay?: number): void;
    /**
     * scale the whole canvas
     */
    scale(scale: number): void;
    /**
     * return the internal canvas
     */
    get canvas(): Component;
    /**
     * redraw the canvas (force a paint)
     */
    private $update_rep;
    redraw(wait?: number): void;
    /**
     *
     */
    private _paint;
    protected paint(ctx: CanvasPainter): void;
}
export {};
