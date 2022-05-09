/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file checkbox.ts
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
import { CEventMap, Component, CProps } from './component';
import { EvChange, EventCallback } from './x4_events';
import { HtmlString } from './tools';
interface CheckBoxEventMap extends CEventMap {
    change?: EvChange;
}
interface CheckBoxProps extends CProps<CheckBoxEventMap> {
    name?: string;
    text?: string | HtmlString;
    checked?: boolean;
    value?: string;
    labelWidth?: number;
    labelAlign?: 'left' | 'right';
    align?: 'left' | 'right';
    change: EventCallback<EvChange>;
}
/**
 * Standard CheckBox
 */
export declare class CheckBox extends Component<CheckBoxProps, CheckBoxEventMap> {
    constructor(props: CheckBoxProps);
    /** @ignore */
    render(props: CheckBoxProps): void;
    /**
     * check state changed
     */
    private _change;
    /**
     * focus gained/loosed
     */
    private _setFocus;
    /**
     * @return the checked value
     */
    get check(): boolean;
    /**
     * change the checked value
     * @param {boolean} ck new checked value
     */
    set check(ck: boolean);
    get text(): string | HtmlString;
    set text(text: string | HtmlString);
    /**
     * toggle the checkbox
     */
    toggle(): void;
}
export {};
