/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file styles.ts
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
     * @param name - variable name without '--'
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
