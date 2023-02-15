/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file styles.ts
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
/**
 *  -- [ @STYLESHEET ] -----------------------------------------------------------------
 */
export declare class Stylesheet {
    private m_sheet;
    private m_rules;
    constructor();
    /**
     * add a new rule to the style sheet
     * @param {string} name - internal rule name
     * @param {string} definition - css definition of the rule
     * @example
     * setRule('xbody', "body { background-color: #ff0000; }" );
     */
    setRule(name: string, definition: any): void;
    /**
     * return the style variable value
     * @param name - variable name
     * @example
     * ```
     * let color = Component.getCss( ).getVar( 'button-color' );
     * ```
     */
    static getVar(name: string): any;
    static guid: number;
    static doc_style: CSSStyleDeclaration;
}
/**
 *  -- [ @CSSPARSER ] -----------------------------------------------------------------
 *
 * adaptation of jss-for-node-js
 */
export declare class CSSParser {
    private result;
    parse(css: any): string;
    static mk_string(rules: any): string;
    private parse_json;
    private makePropertyName;
    private makeSelectorName;
    addProperty(scope: string, property: string, value: any): void;
}
export declare class ComputedStyle {
    m_style: CSSStyleDeclaration;
    constructor(style: CSSStyleDeclaration);
    /**
     * return the raw value
     */
    value(name: string): string;
    /**
     * return the interpreted value
     */
    parse(name: string): number;
    /**
     *
     */
    get style(): CSSStyleDeclaration;
}
