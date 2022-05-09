/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textedit.ts
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
import { Component, EvFocus, HtmlString } from './component';
import { Input, InputProps, InputEventMap } from './input';
import { IconID } from './icon';
import { EvClick, EvChange, EventCallback } from './x4_events';
declare type ValidationFunction = (value: string) => string;
interface TextEditEventMap extends InputEventMap {
    click: EvClick;
    change: EvChange;
    focus: EvFocus;
}
export interface TextEditProps extends InputProps<TextEditEventMap> {
    label?: string | HtmlString;
    labelWidth?: number;
    labelAlign?: 'left' | 'right' | 'top';
    required?: boolean;
    spellcheck?: boolean;
    icon?: IconID;
    pattern?: string;
    uppercase?: boolean;
    format?: string | 'native';
    gadgets?: Component[];
    validator?: ValidationFunction;
    change?: EventCallback<EvChange>;
    click?: EventCallback<EvClick>;
    focus?: EventCallback<EvFocus>;
}
/**
 * TextEdit is a single line editor, it can have a label and an error descriptor.
 */
export declare class TextEdit<T extends TextEditProps = TextEditProps> extends Component<TextEditProps, TextEditEventMap> {
    private m_cal_popup;
    protected m_ui_input: Input;
    private m_error_tip;
    constructor(props: TextEditProps);
    componentCreated(): void;
    componentDisposed(): void;
    focus(): void;
    /** @ignore */
    render(props: TextEditProps): void;
    enable(ena?: boolean): void;
    disable(): void;
    private _btnClick;
    /**
     * select the value format for input/output on textedit of type date
     * cf. formatIntlDate / parseIntlDate
     * @param fmt
     */
    setDateStoreFormat(fmt: string): void;
    setStoreValue(value: any): void;
    getStoreValue(): any;
    private _date_get_hook;
    private _date_set_hook;
    showError(text: string): void;
    clearError(): void;
    get value(): string;
    set value(value: string);
    /**
     * select all the text
     */
    selectAll(): void;
    select(start: number, length?: number): void;
    getSelection(): {
        start: number;
        length: number;
    };
    set readOnly(ro: boolean);
    get label(): string | HtmlString;
    set label(text: string | HtmlString);
    /**
     * content changed
     * todo: should move into Input
     */
    private _change;
    /**
     * getting focus
     */
    private _focus;
    /**
     * loosing focus
     * @param value
     */
    private _blur;
    /**
     * todo: should move into Input
     * @returns
     */
    validate(): boolean;
    private _validate;
    _date_validator(value: string): string;
    private _showDatePicker;
    get input(): Input;
    get type(): import("./input").EditType;
}
export {};
