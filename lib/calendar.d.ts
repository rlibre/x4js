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
import { Popup } from './popup';
import { CProps, ContainerEventMap } from './component';
import { EvChange, EventCallback } from './x4events';
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
