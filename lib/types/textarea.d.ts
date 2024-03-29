/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textarea.ts
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
import { Component, CProps, CEventMap } from './component';
import { EvChange, EventCallback } from './x4events';
interface TextAreaEventMap extends CEventMap {
    change: EvChange;
}
interface Selection {
    start: number;
    end: number;
}
export interface TextAreaProps extends CProps {
    text?: string;
    readOnly?: boolean;
    tabIndex?: number;
    placeHolder?: string;
    name?: string;
    rows?: number;
    autoGrow?: boolean;
    autoFocus?: boolean;
    spellcheck?: boolean;
    change?: EventCallback<EvChange>;
}
export declare class TextArea extends Component<TextAreaProps, TextAreaEventMap> {
    constructor(props: TextAreaProps);
    /** @ignore */
    render(props: TextAreaProps): void;
    private _change;
    componentCreated(): void;
    get value(): string;
    set value(t: string);
    get text(): string;
    set text(text: string);
    private _calcHeight;
    private _updateHeight;
    /**
     * @deprected use appendText
     * insert text at cursor position
     */
    insertText(text: any): void;
    /**
     * append the text
     */
    appendText(text: any): void;
    replaceText(text: any): void;
    getSelection(): Selection;
    setSelection(sel: Selection): void;
    getStoreValue(): any;
    setStoreValue(value: any): void;
}
export {};
