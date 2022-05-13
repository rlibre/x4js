/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file color.ts
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
