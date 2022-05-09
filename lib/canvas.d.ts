/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file canvas.ts
* @author Etienne Cochard
* @license
* Copyright (c) 2019-2021 R-libre ingenierie
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
**/
import { Component, CProps, CEventMap } from './component';
import { BasicEvent, EventCallback } from './x4_events';
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
declare type PaintHandler = (ctx: CanvasPainter) => any;
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
