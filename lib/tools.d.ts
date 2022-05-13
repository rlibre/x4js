/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tools.ts
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
 * @return true is the device has touch
 */
export declare function isTouchDevice(): boolean;
/**
 * round to a given number of decimals
 * @param num numbre to round
 * @param ndec number of decimals
 * @returns number rounded
 */
export declare function roundTo(num: number, ndec: number): number;
/**
 * parse an intl formatted number
 * understand grouping and ',' separator
 * @review us format: grouping = ','
 * @param num
 */
export declare function parseIntlFloat(num: string): number;
/**
 * inverse of camel case
 * theThingToCase -> the-thing-to-case
 * @param {String} str
 */
export declare function pascalCase(string: string): string;
export declare type Constructor<T> = new (...args: any[]) => T;
export declare class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
export declare class Size {
    width: number;
    height: number;
    constructor(w?: number, h?: number);
}
export declare class Rect {
    left: number;
    top: number;
    width: number;
    height: number;
    constructor();
    constructor(rc: Rect);
    constructor(rc: DOMRect);
    constructor(left: number, top: number, width: number, height: number);
    set(left: number, top: number, width: number, height: number): void;
    get bottom(): number;
    set bottom(bottom: number);
    get right(): number;
    set right(right: number);
    get topLeft(): Point;
    get bottomRight(): Point;
    get size(): Size;
    moveTo(left: number, top: number): this;
    movedTo(left: number, top: number): Rect;
    moveBy(dx: number, dy: number): this;
    movedBy(dx: number, dy: number): Rect;
    isEmpty(): boolean;
    normalize(): this;
    normalized(): Rect;
    /**
     * @deprecated
     */
    containsPt(x: number, y: number): boolean;
    contains(pt: Point): boolean;
    contains(rc: Rect): boolean;
    touches(rc: Rect): boolean;
    inflate(dx: number, dy?: number): void;
    inflatedBy(dx: number, dy?: number): Rect;
    combine(rc: Rect): void;
}
/**
 * replace {0..9} by given arguments
 * @param format string
 * @param args
 *
 * @example ```ts
 *
 * console.log( sprintf( 'here is arg 1 {1} and arg 0 {0}', 'argument 0', 'argument 1' ) )
 */
export declare function sprintf(format: string, ...args: any[]): string;
/**
 * replace special characters for display
 * @param unsafe
 *
 * console.log( escapeHtml('<div style="width:50px; height: 50px; background-color:red"></div>') );
 */
export declare function escapeHtml(unsafe: string, nl_br?: boolean): string;
/**
 * replace special characters for display
 * @author Steven Levithan <http://slevithan.com/>
 * @param unsafe
 *
 * console.log( removeHtmlTags('<h1>sss</h1>') );
 */
export declare function removeHtmlTags(unsafe: string, nl_br?: boolean): string;
/**
 * change the current locale for misc translations (date...)
 * @param locale
 */
export declare function _date_set_locale(locale: string): void;
/**
 *
 * @param date
 * @param options
 * @example
 * let date = new Date( );
 * let options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
 * let text = date_format( date, options );
 */
export declare function date_format(date: Date, options?: any): string;
/**
 *
 * @param date
 * @param options
 */
export declare function date_diff(date1: Date, date2: Date, options?: any): string;
export declare function date_to_sql(date: Date, withHours: boolean): string;
/**
 * construct a date from an utc date time (sql format)
 * YYYY-MM-DD HH:MM:SS
 */
export declare function date_sql_utc(date: string): Date;
/**
 * return a number that is a representation of the date
 * this number can be compared with another hash
 */
export declare function date_hash(date: Date): number;
/**
 * return a copy of a date
 */
export declare function date_clone(date: Date): Date;
/**
 * return the week number of a date
 */
export declare function date_calc_weeknum(date: Date): number;
/**
 * parse a date according to the given format
 * @param value - string date to parse
 * @param fmts - format list - i18 tranlation by default
 * allowed format specifiers:
 * d or D: date (1 or 2 digits)
 * m or M: month (1 or 2 digits)
 * y or Y: year (2 or 4 digits)
 * h or H: hours (1 or 2 digits)
 * i or I: minutes (1 or 2 digits)
 * s or S: seconds (1 or 2 digits)
 * <space>: 1 or more spaces
 * any other char: <0 or more spaces><the char><0 or more spaces>
 * each specifiers is separated from other by a pipe (|)
 * more specific at first
 * @example
 * 'd/m/y|d m Y|dmy|y-m-d h:i:s|y-m-d'
 */
export declare function parseIntlDate(value: string, fmts?: string): Date;
/**
 * format a date as string
 * @param date - date to format
 * @param fmt - format
 * format specifiers:
 * d: date
 * D: 2 digits date padded with 0
 * j: day of week short mode 'mon'
 * J: day of week long mode 'monday'
 * w: week number
 * m: month
 * M: 2 digits month padded with 0
 * o: month short mode 'jan'
 * O: month long mode 'january'
 * y or Y: year
 * h: hour (24 format)
 * H: 2 digits hour (24 format) padded with 0
 * i: minutes
 * I: 2 digits minutes padded with 0
 * s: seconds
 * S: 2 digits seconds padded with 0
 * a: am or pm
 * anything else is inserted
 * if you need to insert some text, put it between {}
 *
 * @example
 *
 * 01/01/1970 11:25:00 with '{this is my demo date formatter: }H-i*M'
 * "this is my demo date formatter: 11-25*january"
 */
export declare function formatIntlDate(date: Date, fmt?: string): string;
export declare function calcAge(birth: Date, ref?: Date): number;
/**
 * date object patch
 */
declare global {
    interface Date {
        hash(): number;
        clone(): Date;
        weekNum(): number;
        format(format: string): string;
        isSameDay(date: Date): boolean;
        addDays(days: number): any;
    }
}
/**
 *
 * @param data data to export
 * @param mimetype - 'text/plain'
 */
export declare function downloadData(data: any, mimetype: string, filename: string): void;
/**
 * check if a value is a string
 * @param val
 */
export declare function isString(val: any): val is string;
/**
 * check is a value is an array
 * @param val
 */
export declare function isArray(val: any): val is any[];
/**
 *
 */
export declare function isFunction(val: any): val is Function;
/**
 *
 */
export declare function isLiteralObject(val: any): boolean;
/**
 * prepend 0 to a value to a given length
 * @param value
 * @param length
 */
export declare function pad(what: unknown, size: number, ch?: string): string;
/**
 * return true if val is a finite number
 */
export declare function isNumber(val: any): val is number;
/**
 *
 * @param name
 */
export declare function waitFontLoading(name: string): Promise<void>;
/**
 *
 * @param fn
 * @param tm
 *
 * @example:
 *
 * defer( ( ) => {
 * 	console.log( x );
 * } )(  );
 */
export declare function deferCall(fn: Function, tm?: number, ...args: any[]): void;
/**
 *
 */
export declare function asap(cb: (time: number) => void): void;
/**
 * micro md to html
 *
 * understand:
 * 	**bold**
 * 	*italic*
 *
 *  > quote
 *  - list
 *  # title lvl 1
 *  ## title lvl 2
 *  ### title lvl 3 ...
 *
 */
export declare function markdownToHtml(text: string): string;
/**
 *
 */
export declare class NetworkError extends Error {
    private m_code;
    constructor(response: Response);
    constructor(code: number, text: string);
    get code(): number;
}
/**
 * return the mouse pos in client coordinates
 * handle correctly touch & mouse
 */
export declare function getMousePos(ev: UIEvent, fromDoc: boolean): Point;
/**
 * clamp a value
 * @param v - value to clamp
 * @param min - min value
 * @param max - max value
 * @returns clamped value
 */
export declare function clamp(v: number, min: number, max: number): number;
/**
 *
 */
export interface IDisposable {
    dispose(): any;
}
export declare class HtmlString extends String {
    constructor(text: string);
    static from(text: string): HtmlString;
}
export declare function html(a: any, ...b: any[]): HtmlString;
export declare function isHtmlString(val: any): val is HtmlString;
export declare class Clipboard {
    static copy(data: any): void;
    static paste(cb: (data: string) => void): void;
}
/**
 * Calculates the CRC32 checksum of a string.
 * taken from: https://gist.github.com/wqli78/1330293/6d85cc967f32cccfcbad94ae7d088a3dcfc14bd9
 *
 * @param {String} str
 * @param {Boolean} hex
 * @return {String} checksum
 * @api public
 */
export declare function crc32(str: any): number;
/**
 * taken from this excellent article:
 *	https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 *
 * @example:
 *	class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) {
 *  }
 **/
export declare const mix: (superclass: any) => MixinBuilder;
declare class MixinBuilder {
    private superclass;
    constructor(superclass: any);
    with(...mixins: any[]): any;
}
/**
 * @example
 *
 * ```
 * 	const cls = classNames( 'class1 class2', {
 * 		'class3': false,
 * 		'class4': true,
 *  });
 *
 *  // even shorter
 *  const class1 = true, class2 = false;
 *  const cls = classNames( { class1, class2 } );  // cls = "class1"
 *
 * ```
 *
 * @returns
 */
export declare function classNames(...args: (string | any)[]): string;
/**
 *
 */
interface PasswordRule {
    chars: string;
    min: number;
}
export declare function generatePassword(length: number, rules?: PasswordRule[]): string;
export {};
