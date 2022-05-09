"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bool_formatter = exports.money_formatter_nz = exports.money_formatter = exports.date_formatter = exports.sql_date_formatter = exports.setCurrencySymbol = void 0;
const tools_1 = require("./tools");
let locale;
let moneyFmt;
function setCurrencySymbol(symbol) {
    if (symbol) {
        moneyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: symbol /*, currencyDisplay: 'symbol'*/ });
    }
    else {
        moneyFmt = new Intl.NumberFormat(locale, { style: 'decimal', useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
exports.setCurrencySymbol = setCurrencySymbol;
function sql_date_formatter(input) {
    if (input === null || input === undefined || input === '') {
        return '';
    }
    let dte = new Date(Date.parse(input));
    //todo: better implementation
    const options = { /*weekday: 'short',*/ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return dte.toLocaleDateString(locale, options);
}
exports.sql_date_formatter = sql_date_formatter;
function date_formatter(input) {
    if (input === null || input === undefined || input === '') {
        return '';
    }
    let dte = typeof (input) == 'string' ? new Date(Date.parse(input)) : input;
    return (0, tools_1.formatIntlDate)(dte);
}
exports.date_formatter = date_formatter;
function money_formatter(input) {
    if (input === null || input === undefined || input === '') {
        return '';
    }
    let val = (0, tools_1.roundTo)(typeof (input) == 'string' ? parseFloat(input) : input, 2);
    if (val === -0.00)
        val = 0.00;
    let res = moneyFmt.format(val);
    return res;
}
exports.money_formatter = money_formatter;
function money_formatter_nz(input) {
    if (input === null || input === undefined || input === '') {
        return '';
    }
    let val = (0, tools_1.roundTo)(typeof (input) == 'string' ? parseFloat(input) : input, 2);
    if (!val) { // do not show zeros
        return '';
    }
    let res = moneyFmt.format(val);
    return res;
}
exports.money_formatter_nz = money_formatter_nz;
function bool_formatter(input) {
    return input ? 'oui' : '-';
}
exports.bool_formatter = bool_formatter;
