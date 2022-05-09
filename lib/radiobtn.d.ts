/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file radiobtn.ts
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
import { Component, CProps, CEventMap } from './component';
import { EvChange, EventCallback } from './x4_events';
import { IconID } from './icon';
import { Input } from './input';
interface RadioBtnEventMap extends CEventMap {
    change?: EvChange;
}
export interface RadioBtnProps extends CProps {
    group: string;
    value: string;
    tabIndex?: number | boolean;
    name?: string;
    icon?: IconID;
    text?: string;
    checked?: boolean;
    labelWidth?: number | 'flex';
    align?: 'left' | 'right';
    change?: EventCallback<EvChange>;
}
/**
 * Standard RadioBtn
 */
export declare class RadioBtn extends Component<RadioBtnProps, RadioBtnEventMap> {
    protected m_ui_input: Input;
    constructor(props: RadioBtnProps);
    /** @ignore */
    render(props: RadioBtnProps): void;
    /**
     * check state changed
     */
    private _change;
    /**
     * @return the checked value
     */
    get check(): boolean;
    /**
     * change the checked value
     * @param {boolean} ck new checked value
     */
    set check(ck: boolean);
    get text(): string | import("./tools").HtmlString;
    set text(text: string | import("./tools").HtmlString);
}
export {};
