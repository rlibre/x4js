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
exports.PopupCalendar = exports.Calendar = void 0;
const button_1 = require("./button");
const popup_1 = require("./popup");
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
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
    m_date;
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
        this.m_date = props.date?.clone() ?? new Date();
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
                days.push(new layout_1.HLayout({
                    cls,
                    flex: 1,
                    content: new component_1.Component({
                        tag: 'span',
                        content: (0, tools_1.formatIntlDate)(dte, 'd'),
                    }),
                    dom_events: {
                        click: () => this.select(dte.clone())
                    }
                }));
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
        this.emit('change', (0, x4_events_1.EvChange)(date));
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
            let min = this.m_props.minDate?.getFullYear() ?? 1900;
            let max = this.m_props.maxDate?.getFullYear() ?? 2037;
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
    m_cal;
    constructor(props) {
        super({ tabIndex: 1 });
        this.enableMask(false);
        this.m_cal = new Calendar(props);
        this.m_cal.addClass('@fit');
        this.setContent(this.m_cal);
    }
    // binded
    _handleClick = (e) => {
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
    /** @ignore */
    show(modal) {
        document.addEventListener('mousedown', this._handleClick);
        super.show(modal);
    }
    /** @ignore */
    close() {
        document.removeEventListener('mousedown', this._handleClick);
        super.close();
    }
}
exports.PopupCalendar = PopupCalendar;
