/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file formatters.ts
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

import { formatIntlDate, roundTo } from './tools'

export type FormatFunc = (input: any, rec: any) => string;

let locale: string;
let moneyFmt: Intl.NumberFormat;

export function setCurrencySymbol( symbol: string | null ) {

	if( symbol ) {
		moneyFmt = new Intl.NumberFormat( locale, { style: 'currency', currency: symbol /*, currencyDisplay: 'symbol'*/ } );
	}
	else {
		moneyFmt = new Intl.NumberFormat( locale, { style: 'decimal', useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 } );
	}
}

export function sql_date_formatter(input: any): string {

	if (input === null || input === undefined || input === '') {
		return '';
	}

	let dte = new Date(Date.parse(input));

	//todo: better implementation
	const options: Intl.DateTimeFormatOptions = { /*weekday: 'short',*/ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
	return dte.toLocaleDateString(locale, options)
}

export function date_formatter(input: any): string {

	if (input === null || input === undefined || input === '') {
		return '';
	}

	let dte: Date = typeof (input) == 'string' ? new Date(Date.parse(input)) : input;
	return formatIntlDate(dte);
}

export function money_formatter(input: any): string {

	if (input === null || input === undefined || input === '') {
		return '';
	}

	let val: number = roundTo(typeof (input) == 'string' ? parseFloat(input) : input, 2);
	if (val === -0.00) val = 0.00;

	let res = moneyFmt.format(val);
	return res;
}

export function money_formatter_nz(input: any): string {

	if (input === null || input === undefined || input === '') {
		return '';
	}

	let val: number = roundTo(typeof (input) == 'string' ? parseFloat(input) : input, 2);
	if (!val) {	// do not show zeros
		return '';
	}

	let res = moneyFmt.format(val);
	return res;
}

export function bool_formatter(input: any): string {
	return input ? 'oui' : '-';
}