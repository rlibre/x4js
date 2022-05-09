/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file color.ts
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
export declare class Color {
    private m_value;
    private static custom;
    /**
     * @example
     * ```ts
     * let c = new Color( 255, 255, 255, 0.2 );
     * let d = new Color( "fff" );
     * let e = new Color( "css:selection-color" );
     * let f = new Color( "rgba(255,0,255,0.6)" );
     * ```
     */
    constructor();
    constructor(value: number | string);
    constructor(value: number | string, alpha: number);
    constructor(r: number, g: number, b: number);
    constructor(r: number, g: number, b: number, a: number);
    /**
     *
     */
    private _shade;
    /**
     * return a color darken by percent
     * @param percent
     */
    darken(percent: number): Color;
    /**
     * return a color lighten by percent
     * @param percent
     */
    lighten(percent: number): Color;
    /**
     * mix 2 colors
     * @param {rgb} c1 - color 1
     * @param {rgb} c2 - color 2
     * @param {float} percent - 0.0 to 1.0
     * @example
     * ```js
     * let clr = Color.mix( color1, color2, 0.5 );
     * ```
     */
    static mix(c1: Color, c2: Color, p: number): Color;
    /**
     * split the color into it's base element r,g,b & a (!a 1-255)
     */
    private _split;
    /**
     * change the alpha value
     */
    fadeout(percent: number): Color;
    /**
     *
     */
    static fromHSV(h: number, s: number, v: number, a?: number): Color;
    /**
     *
     */
    static toHSV(c: Color): {
        h: any;
        s: number;
        v: number;
        a: number;
    };
    /**
     *
     */
    static fromHLS(h: number, l: number, s: number): Color;
    /**
     *
     */
    static toHLS(color: Color): {
        h: number;
        l: number;
        s: any;
    };
    /**
     * get the red value of the color
     */
    red(): number;
    /**
     * get the green value of the color
     */
    green(): number;
    /**
     * get the blue value of the color
     */
    blue(): number;
    /**
     * get the alpha value of the color
     */
    alpha(): number;
    /**
     *
     */
    value(): number;
    /**
     * convert the color into string value
     */
    toString(): string;
    toHex(with_alpha?: boolean): string;
    static addCustomColor(name: string, value: Color): void;
    static addCssColor(name: string): void;
    static parse(str: string): Color;
    private _getCustomColor;
    static contrastColor(color: Color): Color;
    /**
     *
     */
    static WHITE: Color;
    /**
     *
     */
    static BLACK: Color;
    /**
     *
     */
    static NONE: Color;
    static valueFromColorName(name: string): Color;
    static fromCssVar(varName: string): string;
}
