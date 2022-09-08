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

import { x4document } from './x4dom'

import { _tr } from './i18n'; 	// you MUST create a file named translation.js

// :: ENVIRONMENT ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/**
 * @return true is the device has touch
 */

export function isTouchDevice() {
	return 'ontouchstart' in window;
}

// :: NUMBERS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


/**
 * round to a given number of decimals
 * @param num numbre to round
 * @param ndec number of decimals
 * @returns number rounded
 */

export function roundTo(num: number, ndec: number) {
	let mul = Math.pow(10, ndec);
	let res = Math.round(num * mul) / mul;
	if (Object.is(res, -0)) {	// res===-0.0 
		res = 0;
	}
	return res;
}

/**
 * parse an intl formatted number
 * understand grouping and ',' separator
 * @review us format: grouping = ','
 * @param num 
 */

export function parseIntlFloat(num: string) {
	num = num.replace(/\s*/g, '');	// group separator
	num = num.replace(',', '.');		// decimal separator

	// accept empty & return 0.0
	if (num.length == 0) {
		return 0.0;
	}

	return parseFloat(num);
}

// :: STRING MANIP ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const RE_PCASE = /([a-z][A-Z])/g;
const RE_PCASE2 = /[^-a-z0-9]+/g;

/**
 * inverse of camel case
 * theThingToCase -> the-thing-to-case
 * @param {String} str 
 */

export function pascalCase(string: string): string {

	let result = string;

	result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
	result = result.toLowerCase();
	result = result.replace(/[^- a-z0-9]+/g, ' ');

	if (result.indexOf(' ') < 0) {
		return result;
	}

	result = result.trim();
	return result.replace(/ /g, '-');
}

export function camelCase( text: string ) {
	let result = text.toLowerCase( );
	result = result.replace( /[^a-zA-Z0-9]+(.)/g, (m,chr) => {
		return chr.toUpperCase();
	} );
	return result;
}

// :: MISC CLASSES ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export type Constructor<T> = new (...args: any[]) => T;

export class Point {
	x: number;
	y: number;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

export class Size {
	width: number;
	height: number;

	constructor(w = 0, h = 0) {
		this.width = w;
		this.height = h;
	}
}

export class Rect {

	left: number;
	top: number;
	width: number;
	height: number;

	constructor();
	constructor(rc: Rect);
	constructor(rc: DOMRect);
	constructor(left: number, top: number, width: number, height: number);
	constructor(left?: number | Rect | DOMRect, top?: number, width?: number, height?: number) {

		if (left === undefined) {
			this.left = this.top = this.right = this.bottom = 0;
		}
		else if (left instanceof Rect || left instanceof DOMRect) {
			let rc = left;
			this.left = rc.left;
			this.top = rc.top;
			this.width = rc.width;
			this.height = rc.height;
		}
		else {
			this.left = left;
			this.top = top;
			this.width = width;
			this.height = height;
		}
	}

	set(left: number, top: number, width: number, height: number) {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	}

	get bottom(): number {
		return this.top + this.height;
	}

	set bottom(bottom: number) {
		this.height = bottom - this.top;
	}

	get right(): number {
		return this.left + this.width;
	}

	set right(right: number) {
		this.width = right - this.left;
	}

	get topLeft(): Point {
		return new Point(this.left, this.top);
	}

	get bottomRight(): Point {
		return new Point(this.right, this.bottom);
	}

	get size(): Size {
		return new Size(this.width, this.height);
	}

	moveTo(left: number, top: number): this {
		this.left = left;
		this.top = top;
		return this;
	}

	movedTo(left: number, top: number): Rect {
		return new Rect(left, top, this.width, this.height);
	}

	moveBy(dx: number, dy: number): this {
		this.left += dx;
		this.top += dy;
		return this;
	}

	movedBy(dx: number, dy: number): Rect {
		return new Rect(this.left + dx, this.top + dy, this.width, this.height);
	}

	isEmpty() {
		return this.width == 0 && this.height == 0;
	}

	normalize(): this {
		let w = this.width,
			h = this.height;

		if (w < 0) {
			this.left += w;
			this.width = -w;
		}

		if (h < 0) {
			this.top += h;
			this.height = -h;
		}

		return this;
	}

	normalized(): Rect {

		let rc = new Rect(this);
		let w = rc.width,
			h = rc.height;


		if (w < 0) {
			rc.left += w;
			rc.width = -w;
		}

		if (h < 0) {
			rc.top += h;
			rc.height = -h;
		}

		return rc;
	}

	/**
	 * @deprecated
	 */
	containsPt(x: number, y: number): boolean {
		return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
	}

	contains(pt: Point): boolean;
	contains(rc: Rect): boolean;
	contains(arg: any): boolean {
		if (arg instanceof Rect) {
			return arg.left >= this.left && arg.right <= this.right && arg.top >= this.top && arg.bottom <= this.bottom;
		}
		else {
			return arg.x >= this.left && arg.x < this.right && arg.y >= this.top && arg.y < this.bottom;
		}
	}

	touches(rc: Rect): boolean {
		if (this.left > rc.right || this.right < rc.left || this.top > rc.bottom || this.bottom < rc.top) {
			return false;
		}

		return true;
	}

	inflate(dx: number, dy?: number) {
		if (dy === undefined) {
			dy = dx;
		}

		this.left -= dx;
		this.top -= dy;
		this.width += dx + dx;
		this.height += dy + dy;
	}

	inflatedBy(dx: number, dy?: number) {
		if (dy === undefined) {
			dy = dx;
		}
		return new Rect(this.left - dx, this.top - dy, this.width + dx + dx, this.height + dy + dy);
	}

	combine(rc: Rect) {
		let left = Math.min(this.left, rc.left);
		let top = Math.min(this.top, rc.top);
		let right = Math.max(this.right, rc.right);
		let bottom = Math.max(this.bottom, rc.bottom);

		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	}
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

export function sprintf(format: string, ...args) {
	return format.replace(/{(\d+)}/g, function (match, index) {
		return typeof args[index] != 'undefined' ? args[index] : match;
	});
}

/**
 * replace special characters for display
 * @param unsafe 
 * 
 * console.log( escapeHtml('<div style="width:50px; height: 50px; background-color:red"></div>') );
 */
export function escapeHtml(unsafe: string, nl_br = false): string {
	if (!unsafe || unsafe.length == 0) {
		return unsafe;
	}

	let result = unsafe.replace(/[<>\&\"\']/g, function (c) {
		return '&#' + c.charCodeAt(0) + ';';
	});

	if (nl_br) {
		result = result.replace(/(\r\n|\n\r|\r|\n)/g, '<br/>');
	}

	return result;
}

/**
 * replace special characters for display
 * @author Steven Levithan <http://slevithan.com/>
 * @param unsafe 
 * 
 * console.log( removeHtmlTags('<h1>sss</h1>') );
 */

export function removeHtmlTags(unsafe: string, nl_br = false): string {
	
	if ( unsafe===undefined || unsafe===null || !isString(unsafe) || unsafe.length == 0 ) {
		return "";
	} 

	let ret_val = '';
	for (let i = 0; i < unsafe.length; i++) {
		const ch = unsafe.codePointAt(i);
		if (ch > 127) {
			ret_val += '&#' + ch + ';';
		}
		else if (ch == 60/*<*/) {
			ret_val += '&lt;'
		}
		else {
			ret_val += unsafe.charAt(i);
		}
	}
	return ret_val;
}


// :: DATES ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

let cur_locale: string = 'fr-FR';

/**
 * change the current locale for misc translations (date...)
 * @param locale 
 */

export function _date_set_locale(locale: string) {
	cur_locale = locale;
}

/**
 * 
 * @param date 
 * @param options 
 * @example
 * let date = new Date( );
 * let options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
 * let text = date_format( date, options );
 */

export function date_format(date: Date, options?: any): string {
	//return new Intl.DateTimeFormat(cur_locale, options).format( date );
	return formatIntlDate(date);
}

/**
 * 
 * @param date 
 * @param options 
 */

export function date_diff(date1: Date, date2: Date, options?: any): string {

	var dt = (date1.getTime() - date2.getTime()) / 1000;

	// seconds
	let sec = dt;
	if (sec < 60) {
		return sprintf(_tr.global.diff_date_seconds, Math.round(sec));
	}

	// minutes
	let min = Math.floor(sec / 60);
	if (min < 60) {
		return sprintf(_tr.global.diff_date_minutes, Math.round(min));
	}

	// hours
	let hrs = Math.floor(min / 60);
	return sprintf(_tr.global.diff_date_hours, hrs, min % 60);
}

export function date_to_sql(date: Date, withHours: boolean) {

	if (withHours) {
		return formatIntlDate(date, 'Y-M-D H:I:S');
	}
	else {
		return formatIntlDate(date, 'Y-M-D');
	}
}

/**
 * construct a date from an utc date time (sql format)
 * YYYY-MM-DD HH:MM:SS
 */

export function date_sql_utc(date: string): Date {
	let result = new Date(date + ' GMT');
	return result;
}



/**
 * return a number that is a representation of the date
 * this number can be compared with another hash
 */

export function date_hash(date: Date): number {
	return date.getFullYear() << 16 | date.getMonth() << 8 | date.getDate();
}

(<any>Date.prototype).hash = function (this: Date) {
	return date_hash(this);
}

/**
 * return a copy of a date
 */

export function date_clone(date: Date): Date {
	return new Date(date.getTime());
}

/**
 * return the week number of a date
 */

export function date_calc_weeknum(date: Date): number {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
	return Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}



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

export function parseIntlDate(value: string, fmts: string = _tr.global.date_input_formats): Date {

	let formats = fmts.split('|');
	for (let fmatch of formats) {

		//review: could do that only once & keep result
		//review: add hours, minutes, seconds

		let smatch = '';
		for (let c of fmatch) {

			if (c == 'd' || c == 'D') {
				smatch += '(?<day>\\d{1,2})';
			}
			else if (c == 'm' || c == 'M') {
				smatch += '(?<month>\\d{1,2})';
			}
			else if (c == 'y' || c == 'Y') {
				smatch += '(?<year>\\d{1,4})';
			}
			else if (c == 'h' || c == 'H') {
				smatch += '(?<hour>\\d{1,2})';
			}
			else if (c == 'i' || c == 'I') {
				smatch += '(?<min>\\d{1,2})';
			}
			else if (c == 's' || c == 'S') {
				smatch += '(?<sec>\\d{1,2})';
			}
			else if (c == ' ') {
				smatch += '\\s+';
			}
			else {
				smatch += '\\s*\\' + c + '\\s*';
			}
		}

		let rematch = new RegExp('^' + smatch + '$', 'm');

		let match = rematch.exec(value);

		if (match) {
			const now = new Date( );

			let d = parseInt(match.groups.day ?? '1');
			let m = parseInt(match.groups.month ?? '1');
			let y = parseInt(match.groups.year ?? now.getFullYear()+'');
			let h = parseInt(match.groups.hour ?? '0');
			let i = parseInt(match.groups.min ?? '0');
			let s = parseInt(match.groups.sec ?? '0');

			if (y > 0 && y < 100) {
				y += 2000;
			}

			let result = new Date(y, m - 1, d, h, i, s, 0);

			// we test the vdate validity (without adjustments)
			// without this test, date ( 0, 0, 0) is accepted and transformed to 1969/11/31 (not fun)
			let ty = result.getFullYear(),
				tm = result.getMonth() + 1,
				td = result.getDate();

			if (ty != y || tm != m || td != d) {
				//debugger;
				return null;
			}

			return result;
		}
	}

	return null;
}

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

export function formatIntlDate(date: Date, fmt: string = _tr.global.date_format) {

	if (!date) {
		return '';
	}

	let now = {
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		wday: date.getDay(),
		hours: date.getHours(),
		minutes: date.getMinutes(),
		seconds: date.getSeconds(),
		milli: date.getMilliseconds()
	};


	let result = '';
	let esc = 0;

	for (let c of fmt) {

		if (c == '{') {
			if (++esc == 1) {
				continue;
			}
		}
		else if (c == '}') {
			if (--esc == 0) {
				continue;
			}
		}

		if (esc) {
			result += c;
			continue;
		}

		if (c == 'd') {
			result += now.day;
		}
		else if (c == 'D') {
			result += pad(now.day, -2);
		}
		else if (c == 'j') { // day short
			result += _tr.global.day_short[now.wday];
		}
		else if (c == 'J') { // day long
			result += _tr.global.day_long[now.wday];
		}
		else if (c == 'w') {	// week
			result += date_calc_weeknum(date);
		}
		else if (c == 'W') {	// week
			result += pad(date_calc_weeknum(date), -2);
		}
		else if (c == 'm') {
			result += now.month;
		}
		else if (c == 'M') {
			result += pad(now.month, -2);
		}
		else if (c == 'o') {	// month short
			result += _tr.global.month_short[now.month - 1];
		}
		else if (c == 'O') {	// month long
			result += _tr.global.month_long[now.month - 1];
		}
		else if (c == 'y' || c == 'Y') {
			result += pad(now.year, -4);
		}
		else if (c == 'a' || c == 'A') {
			result += now.hours < 12 ? 'am' : 'pm';
		}
		else if (c == 'h') {
			result += now.hours;
		}
		else if (c == 'H') {
			result += pad(now.hours, -2);
		}
		else if (c == 'i') {
			result += now.minutes;
		}
		else if (c == 'I') {
			result += pad(now.minutes, -2);
		}
		else if (c == 's') {
			result += now.seconds;
		}
		else if (c == 'S') {
			result += pad(now.seconds, -2);
		}
		else if (c == 'l') {
			result += now.milli;
		}
		else if (c == 'L') {
			result += pad(now.milli, -3);
		}
		else {
			result += c;
		}
	}

	return result;
}

export function calcAge(birth: Date, ref?: Date) {
	if (ref === undefined) {
		ref = new Date();
	}

	if (!birth) {
		return 0;
	}

	let age = ref.getFullYear() - birth.getFullYear();
	if (ref.getMonth() < birth.getMonth() || (ref.getMonth() == birth.getMonth() && ref.getDate() < birth.getDate())) {
		age--;
	}

	return age;
}


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
		addDays( days: number );
	}
}

Date.prototype.isSameDay = function (date: Date) {
	return this.getDate() == date.getDate() && this.getMonth() == date.getMonth() && this.getFullYear() == date.getFullYear();
}

Date.prototype.hash = function () {
	return date_hash(this);
}

Date.prototype.clone = function () {
	return date_clone(this);
}

Date.prototype.weekNum = function () {
	return date_calc_weeknum(this);
}

Date.prototype.format = function (fmt: string) {
	return formatIntlDate(this, fmt);
}

Date.prototype.addDays = function ( days: number ): Date {
	this.setDate( this.getDate() + days );
	return this;
}



// :: FILE CREATION ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


/**
 * 
 * @param data data to export
 * @param mimetype - 'text/plain'
 */

export function downloadData(data, mimetype: string, filename: string) {

	//if (data !== null && navigator.msSaveBlob) {
	//	return navigator.msSaveBlob(new Blob([data], { type: mimetype }), filename);
	//}

	let blob = new Blob([data], { type: mimetype });
	let url = window.URL.createObjectURL(blob);

	let a = x4document.createElement("a");
	a.style['display'] = "none";
	a.href = url;
	a.download = filename;
	x4document.body.appendChild(a);

	a.click();
	window.URL.revokeObjectURL(url);
}

// :: MISC ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


/**
 * check if a value is a string
 * @param val 
 */
export function isString(val: any): val is string {
	return typeof val === 'string';
}

/**
 * check is a value is an array
 * @param val 
 */
export function isArray(val: any): val is any[] {
	return val instanceof Array;
}

/**
 * 
 */

export function isFunction(val: any): val is Function {
	return val instanceof Function;
}

/**
 * 
 */

export function isLiteralObject(val: any) {
	return (!!val) && (val.constructor === Object);
};

/**
 * prepend 0 to a value to a given length
 * @param value 
 * @param length 
 */

export function pad(what: unknown, size: number, ch: string = '0') {

	let value: string;

	if (!isString(what)) {
		value = '' + what;
	}
	else {
		value = what;
	}

	if (size > 0) {
		return value.padEnd(size, ch);
	}
	else {
		return value.padStart(-size, ch);
	}
}


/**
 * return true if val is a finite number
 */

export function isNumber(val: any): val is number {
	return typeof val === 'number' && isFinite(val);
}

/**
 * 
 * @param name 
 */

export function waitFontLoading(name: string) {

	// tip for waiting font loading:
	// by default, body is created invisible ((opacity = 0)
	// we create a div inside with the font we need to wait the loading
	// as soon as the font is loaded, it's size will change, the browser end font loading
	// we can remove the div.
	// pitfall: if the font is already loaded, ne never end.
	// @review that

	let ct = x4document.createElement('div');

	ct.style.position = 'absolute';
	ct.style.fontFamily = name;
	ct.style.fontSize = '44px';
	ct.style.opacity = '0.001';
	ct.innerText = 'X';

	x4document.body.appendChild(ct);

	return new Promise<void>((resolve) => {

		let irc = ct.getBoundingClientRect();
		let tm = setInterval(() => {

			let nrc = ct.getBoundingClientRect();
			if (nrc.height != irc.height) {
				clearInterval(tm);
				x4document.body.removeChild(ct);

				resolve();
			}
		}, 0);
	});
}

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

export function deferCall(fn: Function, tm = 0, ...args) {
	setTimeout(fn, tm, ...args);
}

/**
 * 
 */

export function asap(cb: (time: number) => void) {
	requestAnimationFrame(cb);
}



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

export function markdownToHtml(text: string): string {

	if (!text) {
		return '';
	}

	let lines = text.split('\n');

	let state = 'para';
	let div = 'p';
	let result: string[] = [];

	lines.forEach((l) => {

		let txt = l.trim();

		if (state == 'para') {
			// entree en mode list
			if (txt[0] == '-') {
				txt = txt.substr(1);
				result.push('<ul>')
				state = 'list';
				div = 'li';
			}
			else if (txt[0] == '>') {
				txt = txt.substr(1);
				result.push('<blockquote>')
				state = 'quote';
				div = 'p';
			}
			else if (txt[0] == '#') {
				let lvl = 0;
				do {
					txt = txt.substr(1);
					lvl++;
				} while (txt[0] == '#' && lvl < 5);

				div = 'h' + lvl;
				state = 'title';
			}
		}
		else if (state == 'list') {
			// sortie du mode list
			if (txt[0] != '-') {
				result.push('</ul>')
				state = 'para';
				div = 'p';
			}
			else {
				txt = txt.substr(1);
			}
		}
		else if (state == 'quote') {

			// sortie du mode blockquote
			if (txt[0] != '>') {
				result.push('</blockquote>')
				state = 'para';
				div = 'p';
			}
			else {
				txt = txt.substr(1);
			}
		}

		let reBold = /\*\*([^*]+)\*\*/gi;

		txt = escapeHtml(txt, false);
		txt = txt.replace(reBold, (sub: string, ...a): string => {
			return '<b>' + sub.substr(2, sub.length - 4) + '</b>';
		});

		let reItalic = /\*([^*]+)\*/gi;
		txt = txt.replace(reItalic, (sub: string, ...a): string => {
			return '<i>' + sub.substr(1, sub.length - 2) + '</i>';
		});

		// keep empty lines
		if (txt == '') {
			txt = '&nbsp;';
		}

		result.push(`<${div}>` + txt + `</${div}>`);

		if (state == 'title') {
			state = 'para';
			div = 'p';
		}
	});

	if (state == 'list') {
		result.push('</ul>')
	}
	else if (state == 'quote') {
		result.push('</blockquote>')
	}

	return result.join('');
}


/**
 * 
 */

export class NetworkError extends Error {

	private m_code: number;

	constructor(response: Response);
	constructor(code: number, text: string);
	constructor(a: number | Response, b?: string) {

		if (a instanceof Response) {
			super(a.statusText);
			this.m_code = a.status;
		}
		else {
			super(b);
			this.m_code = a;
		}
	}

	get code(): number {
		return this.m_code;
	}
}

/**
 * return the mouse pos in client coordinates
 * handle correctly touch & mouse
 */

export function getMousePos(ev: UIEvent, fromDoc: boolean): Point {

	let x_name = 'offsetX',
		y_name = 'offsetY';

	if (fromDoc) {
		x_name = 'clientX';
		y_name = 'clientY';
	}

	if (ev.type == 'mousemove' || ev.type == 'mousedown' || ev.type == 'mouseup') {
		let em = ev as MouseEvent;
		return new Point(em[x_name], em[y_name]);
	}
	else if (ev.type == 'pointermove' || ev.type == 'pointerdown' || ev.type == 'pointerup') {
		let em = ev as MouseEvent;
		return new Point(em[x_name], em[y_name]);
	}
	else if (ev.type == 'touchmove' || ev.type == 'touchstart') {
		let et = ev as TouchEvent;
		return new Point(et.touches[0][x_name], et.touches[0][y_name]);
	}
	else if (ev.type == 'contextmenu') {
		let em = ev as MouseEvent;
		return new Point(em[x_name], em[y_name]);
	}
	else {
		return new Point(0, 0);
	}
}

/**
 * clamp a value
 * @param v - value to clamp
 * @param min - min value
 * @param max - max value
 * @returns clamped value
 */

export function clamp(v: number, min: number, max: number) {
	return Math.min(Math.max(v, min), max);
}


/**
 * 
 */

export interface IDisposable {
	dispose();
}

// :: HTML strings ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export class HtmlString extends String {
	constructor(text: string) { super(text); }

	static from(text: string) {
		return new HtmlString(text);
	}
}

export function html(a, ...b): HtmlString {
	return HtmlString.from(String.raw(a, ...b));
}

export function isHtmlString(val: any): val is HtmlString {
	return val instanceof HtmlString;
}

// :: CLIPBOARD ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export class Clipboard {
	static copy(data: any) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(JSON.stringify(data));
		}
	}

	static paste(cb: (data: string) => void) {
		if (navigator.clipboard) {
			navigator.clipboard.readText().then(v => cb(v));
		}
		else {
			console.error('no clipboard, are you in https ?');
		}
	}
}


// :: CRC32 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/**
 * Calculates the CRC32 checksum of a string.
 * taken from: https://gist.github.com/wqli78/1330293/6d85cc967f32cccfcbad94ae7d088a3dcfc14bd9
 *
 * @param {String} str
 * @param {Boolean} hex
 * @return {String} checksum
 * @api public
 */

export function crc32(str) {

	let crc = ~0;
	for (let i = 0, l = str.length; i < l; i++) {
		crc = (crc >>> 8) ^ crc32tab[(crc ^ str.charCodeAt(i)) & 0xff];
	}
	return Math.abs(crc ^ -1);
}

var crc32tab = [
	0x00000000, 0x77073096, 0xee0e612c, 0x990951ba,
	0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
	0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
	0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
	0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
	0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
	0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec,
	0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
	0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
	0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
	0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940,
	0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
	0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116,
	0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
	0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
	0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
	0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a,
	0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
	0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818,
	0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
	0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
	0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
	0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c,
	0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
	0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
	0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
	0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
	0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
	0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086,
	0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
	0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4,
	0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
	0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
	0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
	0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
	0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
	0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe,
	0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
	0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
	0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
	0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252,
	0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
	0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60,
	0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
	0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
	0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
	0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04,
	0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
	0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a,
	0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
	0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
	0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
	0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e,
	0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
	0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
	0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
	0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
	0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
	0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0,
	0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
	0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6,
	0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
	0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
	0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
];


// :: MIXINS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/**
 * taken from this excellent article:
 *	https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 *
 * @example:
 *	class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) {
 *  }
 **/

export const mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {

	private superclass: any;

	constructor(superclass) {
		this.superclass = superclass;
	}

	with(...mixins) {
		return mixins.reduce((c, mixin) => mixin(c), this.superclass);
	}
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

export function classNames(...args: (string | any)[]) {

	let result = '';

	for (const cls of args) {
		if (typeof cls === 'string') {
			result += ' ' + cls;
		}
		else if (cls) {
			for (const c in cls) {
				if (cls[c])
					result += ' ' + c;
			}
		}
	}

	return result;
}

/**
 * 
 */

interface PasswordRule {
	chars: string;
	min: number;
}

export function generatePassword(length: number, rules?: PasswordRule[]) {

	if (!length || length == undefined) {
		length = 8;
	}

	if (!rules) {
		rules = [
			{ chars: "abcdefghijklmnopqrstuvwxyz", min: 3 },  // As least 3 lowercase letters
			{ chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", min: 2 },  // At least 2 uppercase letters
			{ chars: "0123456789", min: 2 },                  // At least 2 digits
			{ chars: "!@#$*|%+-_.;", min: 2 }      // At least 1 special char
		];
	}

	let allChars = "";
	let allMin = 0;

	rules.forEach(function (rule) {
		allChars += rule.chars;
		allMin += rule.min;
	});

	if (length < allMin) {
		length = allMin;
	}

	rules.push({ chars: allChars, min: length - allMin });

	let pswd = "";
	rules.forEach(function (rule) {
		if (rule.min > 0) {
			pswd += shuffle(rule.chars, rule.min);
		}
	});

	return shuffle(pswd);
}

function shuffle(str: string, maxlength?: number) {
	let shuffled = str.split('').sort(() => {
		return 0.5 - Math.random()
	}).join('');

	if (maxlength > 0) {
		shuffled = shuffled.substr(0, maxlength);
	}

	return shuffled;
}



/**
 * taken from live-server 
 * https://github.com/tapio/live-server
 * @param host 
 * @param port 
 */
 
export function installHMR(host = "127.0.0.1", port = "9876", reloadCallback?: Function ) {

	let tm;

	function refreshCSS() {

		document.body.style.visibility = "hidden";

		let sheets = [].slice.call(document.getElementsByTagName("link"));
		let head = document.getElementsByTagName("head")[0];
		
		for (let i = 0; i < sheets.length; ++i) {
			let elem = sheets[i];
			head.removeChild(elem);

			let rel = elem.rel;
			if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
				let url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
				elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
			}
			
			head.appendChild(elem);
		}

		if( tm ) { clearTimeout(tm); }
		tm = setTimeout( () => {
			document.body.style.visibility = "unset";
		}, 50 );
	}

	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const address = `${protocol}${host}:${port}/ws`;	
	const socket = new WebSocket(address);

	socket.onmessage = function (msg) {
		if (msg.data == 'reload') {
			if( reloadCallback ) {
				reloadCallback( );
			}
			else {
				window.location.reload();
			}
		}
		else if (msg.data == 'refreshcss') {
			refreshCSS();
		}
	};

	console.log('Live reload enabled.');
}