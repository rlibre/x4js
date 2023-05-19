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

import { x4document } from './x4dom'

import { Button } from './button';
import { Popup } from './popup';
import { Component, CProps, ContainerEventMap, Flex } from './component'
import { EvChange, EventCallback } from './x4events'
import { Point } from "./tools"

import { _tr } from './i18n';
import { Label } from './label';
import { HLayout, VLayout } from './layout'
import { date_hash, date_clone, formatIntlDate } from './tools'
import { Menu, MenuItem } from './menu';


interface CalendarEventMap extends ContainerEventMap {
	change?: EvChange;
}


interface CalendarProps extends CProps<CalendarEventMap> {
	date?: Date;	// initial date to display
	minDate?: Date;	// minimal date before the user cannot go
	maxDate?: Date;	// maximal date after the user cannot go

	change?: EventCallback<EvChange>; // shortcut to events: { change: ... }
}


/**
 * default calendar control
 * 
 * fires:
 * 	EventChange ( value = Date )
 */

export class Calendar extends VLayout<CalendarProps, CalendarEventMap>
{
	private m_date: Date;

	constructor(props: CalendarProps) {
		super(props);

		this.mapPropEvents( props, 'change' );
		this.m_date = props.date?.clone() ?? new Date();
	}

	/** @ignore */

	render(props: CalendarProps) {

		let month_start = date_clone(this.m_date);
		month_start.setDate(1);

		let day = month_start.getDay();
		if (day == 0) {
			day = 7;
		}

		month_start.setDate(-day + 1 + 1);
		let dte = date_clone(month_start);

		let today = this.m_date.hash();

		let month_end = date_clone(this.m_date);
		month_end.setDate(1);
		month_end.setMonth(month_end.getMonth() + 1);
		month_end.setDate(0);

		let end_of_month = date_hash(month_end);

		let rows: HLayout[] = [];

		// month selector
		let header = new HLayout({
			cls: 'month-sel',
			content: [
				new Label({
					cls: 'month',
					text: formatIntlDate(this.m_date, 'O'),
					dom_events: {
						click: () => this._choose('month')
					}
				}),
				new Label({
					cls: 'year',
					text: formatIntlDate(this.m_date, 'Y'),
					dom_events: {
						click: () => this._choose('year')
					}
				}),
				new Flex(),
				new Button({ text: '<', click: () => this._next(false) } ),
				new Button({ text: '>', click: () => this._next(true) } )
			]
		});

		rows.push(header);

		// calendar part
		let day_names = [];

		// day names
		// empty week num
		day_names.push(new HLayout({
			cls: 'weeknum cell',
		}));

		for (let d = 0; d < 7; d++) {
			day_names.push(new Label({
				cls: 'cell',
				flex: 1,
				text: _tr.global.day_short[(d + 1) % 7]
			}));
		}

		rows.push(new HLayout({
			cls: 'week header',
			content: day_names
		}));

		let cmonth = this.m_date.getMonth();

		// weeks
		let first = true;
		while (date_hash(dte) <= end_of_month) {

			let days = [
				new HLayout({ cls: 'weeknum cell', content: new Component({ tag: 'span', content: formatIntlDate(dte, 'w') }) })
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

				const mkItem = ( dte ) => {
					return new HLayout({
						cls,
						flex: 1,
						content: new Component({
							tag: 'span',
							content: formatIntlDate(dte, 'd'),
						}),
						dom_events: {
							click: () => this.select(dte)
						}
					})
				}

				days.push( mkItem( dte.clone() ) );

				dte.setDate(dte.getDate() + 1);
				first = false;
			}

			rows.push(new HLayout({
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

	private select(date: Date) {
		this.m_date = date;
		this.emit('change', EvChange(date));
		this.update();
	}

	/**
	 * 
	 */

	private _next(n: boolean) {
		this.m_date.setMonth(this.m_date.getMonth() + (n ? 1 : -1));
		this.update();
	}

	/**
	 * 
	 */

	private _choose(type: 'month' | 'year') {

		let items: MenuItem[] = [];

		if (type == 'month') {
			for (let m = 0; m < 12; m++) {
				items.push(new MenuItem({
					text: _tr.global.month_long[m],
					click: () => { this.m_date.setMonth(m); this.update(); }
				}));
			}
		}
		else if (type == 'year') {

			let min = this.m_props.minDate?.getFullYear() ?? 1900;
			let max = this.m_props.maxDate?.getFullYear() ?? 2037;

			for (let m = max; m >= min; m--) {
				items.push(new MenuItem({
					text: '' + m,
					click: () => { this.m_date.setFullYear(m); this.update(); }
				}));
			}
		}

		let menu = new Menu({
			items
		});

		let rc = this.getBoundingRect();
		menu.displayAt(rc.left, rc.top);
	}

	get date() {
		return this.m_date;
	}

	set date(date: Date) {
		this.m_date = date;
		this.update();
	}
}

/**
 * default popup calendar
 */

export class PopupCalendar extends Popup {

	m_cal: Calendar;

	constructor(props: CalendarProps) {
		super({ tabIndex: 1 });

		this.enableMask(false);

		this.m_cal = new Calendar(props);
		this.m_cal.addClass('@fit');

		this.setContent(this.m_cal);
	}

	// binded
	private _handleClick = (e: MouseEvent) => {
		if (!this.dom) {
			return;
		}

		let newfocus = <HTMLElement>e.target;

		// child of this: ok
		if (this.dom.contains(newfocus)) {
			return;
		}

		// menu: ok
		let dest = Component.getElement(newfocus, MenuItem);
		if (dest) {
			return;
		}

		this.close();
	}

	/** @ignore */
	show(modal?: boolean, at?: Point ) {
		x4document.addEventListener('mousedown', this._handleClick);
		if( at ) {
			super.displayAt( at.x, at.y, 'top left', undefined, modal );
		}
		else {
			super.show(modal);
		}
	}

	/** @ignore */
	close() {
		x4document.removeEventListener('mousedown', this._handleClick);
		super.close();
	}

}