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
    if (Object.is(val, -0.00)) {
        val = 0.00;
    }
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
setCurrencySymbol(null);
