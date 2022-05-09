/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file svgcomponent.ts
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
import { Component, CProps } from './component';
/**
 *
 */
declare abstract class SVGItem {
    private m_tag;
    private m_attrs;
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
    stroke(color: string): this;
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
    /**
     * add a class
     * @param name class name to add
     */
    class(name: string): this;
    /**
     *
     */
    renderAttrs(): string;
    renderContent(): string;
}
/**
 *
 */
declare class SVGPath extends SVGItem {
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
declare class SVGText extends SVGItem {
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
declare class SVGShape extends SVGItem {
    constructor(tag: string);
}
/**
 *
 */
declare class SVGGradient extends SVGItem {
    private static g_id;
    private m_id;
    private m_stops;
    constructor(x1: number, y1: number, x2: number, y2: number);
    get id(): string;
    addStop(offset: number, color: string): this;
    renderContent(): string;
}
/**
 *
 */
export declare class SVGPathBuilder {
    private m_items;
    constructor();
    path(): SVGPath;
    text(x: any, y: any, txt: any): SVGText;
    ellipse(x: any, y: any, r1: any, r2?: any): SVGShape;
    rect(x: any, y: any, w: any, h: any): SVGShape;
    gradient(x1: any, y1: any, x2: any, y2: any): SVGGradient;
    /**
     * clear
     */
    clear(): void;
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
