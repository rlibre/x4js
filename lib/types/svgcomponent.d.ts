/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file svgcomponent.ts
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
import { Component, CProps } from './component';
/**
 *
 */
export declare abstract class SVGItem {
    private m_tag;
    private m_attrs;
    private m_style;
    constructor(tag: string);
    /**
     * render the item
     * @returns
     */
    render(): string;
    /**
     * change the stroke color
     * @param color
     */
    stroke(color: string, width?: number): this;
    /**
     * change the stroke width
     * @param width
     */
    strokeWidth(width: number): this;
    /**
     * change the fill color
     * @param color
     */
    fill(color: string): this;
    /**
     * define a new attribute
     * @param name attibute name
     * @param value attribute value
     * @returns this
     */
    attr(name: string, value: string): this;
    style(name: string, value: string | number): this;
    /**
     * add a class
     * @param name class name to add
     */
    class(name: string): this;
    /**
     *
     */
    renderAttrs(): string;
    /**
     *
     */
    renderStyle(): string;
    /**
     *
     */
    renderContent(): string;
    /**
     *
     */
    clip(id: string): this;
    /**
     *
     */
    transform(tr: string): this;
    /**
     *
     */
    rotate(deg: number, cx: number, cy: number): this;
    translate(dx: number, dy: number): this;
    scale(x: number): this;
}
/**
 *
 */
export declare class SVGPath extends SVGItem {
    private m_path;
    constructor();
    renderAttrs(): string;
    /**
     * move the current pos
     * @param x new pos x
     * @param y new pos y
     * @returns this
     */
    moveTo(x: number, y: number): this;
    /**
     * draw aline to the given point
     * @param x end x
     * @param y end y
     * @returns this
     */
    lineTo(x: number, y: number): this;
    /**
     * close the currentPath
     */
    closePath(): this;
    /**
     * draw an arc
     * @param x center x
     * @param y center y
     * @param r radius
     * @param start angle start in degrees
     * @param end angle end in degrees
     * @returns this
     */
    arc(x: number, y: number, r: number, start: number, end: number): this;
}
/**
 *
 */
export declare class SVGText extends SVGItem {
    private m_text;
    constructor(x: number, y: number, txt: string);
    font(font: string): this;
    fontSize(size: number | string): this;
    fontWeight(weight: 'light' | 'normal' | 'bold'): this;
    textAlign(align: 'left' | 'center' | 'right'): this;
    verticalAlign(align: 'top' | 'center' | 'bottom'): this;
    renderContent(): any;
}
/**
 *
 */
export declare class SVGShape extends SVGItem {
    constructor(tag: string);
}
/**
 *
 */
type number_or_perc = number | `${string}%`;
export declare class SVGGradient extends SVGItem {
    private static g_id;
    private m_id;
    private m_stops;
    constructor(x1: number_or_perc, y1: number_or_perc, x2: number_or_perc, y2: number_or_perc);
    get id(): string;
    addStop(offset: number_or_perc, color: string): this;
    renderContent(): string;
}
/**
 *
 */
export declare class SVGGroup extends SVGItem {
    protected m_items: SVGItem[];
    constructor(tag?: string);
    path(): SVGPath;
    text(x: any, y: any, txt: any): SVGText;
    ellipse(x: any, y: any, r1: any, r2?: any): SVGShape;
    rect(x: any, y: any, w: any, h: any): SVGShape;
    group(): SVGGroup;
    /**
     *
     * example
     * ```ts
     * const g = c.linear_gradient( '0%', '0%', '0%', '100%' )
     * 				.addStop( 0, 'red' )
     * 				.addStop( 100, 'green' );
     *
     * p.rect( 0, 0, 100, 100 )
     * 		.stroke( g.id );
     *
     * ```
     */
    linear_gradient(x1: number_or_perc, y1: number_or_perc, x2: number_or_perc, y2: number_or_perc): SVGGradient;
    /**
     * clear
     */
    clear(): void;
    renderContent(): string;
}
/**
 *
 */
export declare class SVGPathBuilder extends SVGGroup {
    private static g_clip_id;
    constructor();
    addClip(x: number, y: number, w: number, h: number): string;
    render(): string;
}
/**
 *
 */
export interface SVGProps extends CProps {
    viewBox?: string;
    path?: string;
}
export declare class SVGComponent<P extends SVGProps = SVGProps> extends Component<P> {
    constructor(props: P);
}
export {};
