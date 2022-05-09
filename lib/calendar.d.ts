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
import { Popup } from './popup';
import { CProps, ContainerEventMap } from './component';
import { EvChange, EventCallback } from './x4_events';
import { VLayout } from './layout';
interface CalendarEventMap extends ContainerEventMap {
    change?: EvChange;
}
interface CalendarProps extends CProps<CalendarEventMap> {
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
    change?: EventCallback<EvChange>;
}
/**
 * default calendar control
 *
 * fires:
 * 	EventChange ( value = Date )
 */
export declare class Calendar extends VLayout<CalendarProps, CalendarEventMap> {
    private m_date;
    constructor(props: CalendarProps);
    /** @ignore */
    render(props: CalendarProps): void;
    /**
     * select the given date
     * @param date
     */
    private select;
    /**
     *
     */
    private _next;
    /**
     *
     */
    private _choose;
    get date(): Date;
    set date(date: Date);
}
/**
 * default popup calendar
 */
export declare class PopupCalendar extends Popup {
    m_cal: Calendar;
    constructor(props: CalendarProps);
    private _handleClick;
    /** @ignore */
    show(modal?: boolean): void;
    /** @ignore */
    close(): void;
}
export {};
