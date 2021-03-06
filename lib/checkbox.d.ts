/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file checkbox.ts
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
import { CEventMap, Component, CProps } from './component';
import { EvChange, EventCallback } from './x4events';
import { HtmlString } from './tools';
interface CheckBoxEventMap extends CEventMap {
    change?: EvChange;
}
interface CheckBoxProps extends CProps<CheckBoxEventMap> {
    name?: string;
    text?: string | HtmlString;
    checked?: boolean;
    value?: string;
    slider?: boolean;
    labelWidth?: number;
    labelAlign?: 'left' | 'right';
    align?: 'left' | 'right';
    change?: EventCallback<EvChange>;
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
