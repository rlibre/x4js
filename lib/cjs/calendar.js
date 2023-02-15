"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file calendar.ts
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
exports.PopupCalendar = exports.Calendar = void 0;
const x4dom_1 = require("./x4dom");
const button_1 = require("./button");
const popup_1 = require("./popup");
const component_1 = require("./component");
const x4events_1 = require("./x4events");
const i18n_1 = require("./i18n");
const label_1 = require("./label");
const layout_1 = require("./layout");
const tools_1 = require("./tools");
const menu_1 = require("./menu");
/**
 * default calendar control
 *
 * fires:
 * 	EventChange ( value = Date )
 */
class Calendar extends layout_1.VLayout {
    constructor(props) {
        var _a, _b;
        super(props);
        this.mapPropEvents(props, 'change');
        this.m_date = (_b = (_a = props.date) === null || _a === void 0 ? void 0 : _a.clone()) !== null && _b !== void 0 ? _b : new Date();
    }
    /** @ignore */
    render(props) {
        let month_start = (0, tools_1.date_clone)(this.m_date);
        month_start.setDate(1);
        let day = month_start.getDay();
        if (day == 0) {
            day = 7;
        }
        month_start.setDate(-day + 1 + 1);
        let dte = (0, tools_1.date_clone)(month_start);
        let today = this.m_date.hash();
        let month_end = (0, tools_1.date_clone)(this.m_date);
        month_end.setDate(1);
        month_end.setMonth(month_end.getMonth() + 1);
        month_end.setDate(0);
        let end_of_month = (0, tools_1.date_hash)(month_end);
        let rows = [];
        // month selector
        let header = new layout_1.HLayout({
            cls: 'month-sel',
            content: [
                new label_1.Label({
                    cls: 'month',
                    text: (0, tools_1.formatIntlDate)(this.m_date, 'O'),
                    dom_events: {
                        click: () => this._choose('month')
                    }
                }),
                new label_1.Label({
                    cls: 'year',
                    text: (0, tools_1.formatIntlDate)(this.m_date, 'Y'),
                    dom_events: {
                        click: () => this._choose('year')
                    }
                }),
                new component_1.Flex(),
                new button_1.Button({ text: '<', click: () => this._next(false) }),
                new button_1.Button({ text: '>', click: () => this._next(true) })
            ]
        });
        rows.push(header);
        // calendar part
        let day_names = [];
        // day names
        // empty week num
        day_names.push(new layout_1.HLayout({
            cls: 'weeknum cell',
        }));
        for (let d = 0; d < 7; d++) {
            day_names.push(new label_1.Label({
                cls: 'cell',
                flex: 1,
                text: i18n_1._tr.global.day_short[(d + 1) % 7]
            }));
        }
        rows.push(new layout_1.HLayout({
            cls: 'week header',
            content: day_names
        }));
        let cmonth = this.m_date.getMonth();
        // weeks
        let first = true;
        while ((0, tools_1.date_hash)(dte) <= end_of_month) {
            let days = [
                new layout_1.HLayout({ cls: 'weeknum cell', content: new component_1.Component({ tag: 'span', content: (0, tools_1.formatIntlDate)(dte, 'w') }) })
            ];
            // days
            for (let d = 0; d < 7; d++) {
                let cls = 'cell day';
                if (dte.hash() == today) {
                    cls += ' today';
                }
                if (dte.getMonth() != cmonth) {
                    cls += ' out';
                }
                const mkItem = (dte) => {
                    return new layout_1.HLayout({
                        cls,
                        flex: 1,
                        content: new component_1.Component({
                            tag: 'span',
                            content: (0, tools_1.formatIntlDate)(dte, 'd'),
                        }),
                        dom_events: {
                            click: () => this.select(dte)
                        }
                    });
                };
                days.push(mkItem(dte.clone()));
                dte.setDate(dte.getDate() + 1);
                first = false;
            }
            rows.push(new layout_1.HLayout({
                cls: 'week',
                flex: 1,
                content: days
            }));
        }
        this.setContent(rows);
    }
    /**
     * select the given date
     * @param date
     */
    select(date) {
        this.m_date = date;
        this.emit('change', (0, x4events_1.EvChange)(date));
        this.update();
    }
    /**
     *
     */
    _next(n) {
        this.m_date.setMonth(this.m_date.getMonth() + (n ? 1 : -1));
        this.update();
    }
    /**
     *
     */
    _choose(type) {
        var _a, _b, _c, _d;
        let items = [];
        if (type == 'month') {
            for (let m = 0; m < 12; m++) {
                items.push(new menu_1.MenuItem({
                    text: i18n_1._tr.global.month_long[m],
                    click: () => { this.m_date.setMonth(m); this.update(); }
                }));
            }
        }
        else if (type == 'year') {
            let min = (_b = (_a = this.m_props.minDate) === null || _a === void 0 ? void 0 : _a.getFullYear()) !== null && _b !== void 0 ? _b : 1900;
            let max = (_d = (_c = this.m_props.maxDate) === null || _c === void 0 ? void 0 : _c.getFullYear()) !== null && _d !== void 0 ? _d : 2037;
            for (let m = min; m < max; m++) {
                items.push(new menu_1.MenuItem({
                    text: '' + m,
                    click: () => { this.m_date.setFullYear(m); this.update(); }
                }));
            }
        }
        let menu = new menu_1.Menu({
            items
        });
        let rc = this.getBoundingRect();
        menu.displayAt(rc.left, rc.top);
    }
    get date() {
        return this.m_date;
    }
    set date(date) {
        this.m_date = date;
        this.update();
    }
}
exports.Calendar = Calendar;
/**
 * default popup calendar
 */
class PopupCalendar extends popup_1.Popup {
    constructor(props) {
        super({ tabIndex: 1 });
        // binded
        this._handleClick = (e) => {
            if (!this.dom) {
                return;
            }
            let newfocus = e.target;
            // child of this: ok
            if (this.dom.contains(newfocus)) {
                return;
            }
            // menu: ok
            let dest = component_1.Component.getElement(newfocus, menu_1.MenuItem);
            if (dest) {
                return;
            }
            this.close();
        };
        this.enableMask(false);
        this.m_cal = new Calendar(props);
        this.m_cal.addClass('@fit');
        this.setContent(this.m_cal);
    }
    /** @ignore */
    show(modal, at) {
        x4dom_1.x4document.addEventListener('mousedown', this._handleClick);
        if (at) {
            super.displayAt(at.x, at.y, 'top left', undefined, modal);
        }
        else {
            super.show(modal);
        }
    }
    /** @ignore */
    close() {
        x4dom_1.x4document.removeEventListener('mousedown', this._handleClick);
        super.close();
    }
}
exports.PopupCalendar = PopupCalendar;
