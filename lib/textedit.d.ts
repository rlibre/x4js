/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textedit.ts
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
import { Component, EvFocus, HtmlString } from './component';
import { Input, InputProps, InputEventMap } from './input';
import { IconID } from './icon';
import { EvClick, EvChange, EventCallback } from './x4events';
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
