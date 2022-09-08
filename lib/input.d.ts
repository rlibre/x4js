/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file input.ts
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
export declare type EditType = 'text' | 'number' | 'email' | 'date' | 'password' | 'file' | 'checkbox' | 'radio';
export interface ValueHook {
    get(): any;
    set(v: any): void;
}
export interface InputEventMap extends CEventMap {
}
export interface InputProps<P extends InputEventMap = InputEventMap> extends CProps<P> {
    value?: string;
    name?: string;
    type?: EditType;
    placeHolder?: string;
    autoFocus?: boolean;
    readOnly?: boolean;
    tabIndex?: number | boolean;
    pattern?: string;
    uppercase?: boolean;
    spellcheck?: boolean;
    value_hook?: ValueHook;
    min?: number;
    max?: number;
    autosel?: boolean;
}
/**
 * base class for elements implementing an input
 * CARE derived classes must set this.ui.input
 */
export declare class Input extends Component<InputProps, InputEventMap> {
    constructor(props: InputProps);
    /** @ignore */
    render(props: InputProps): void;
    getType(): EditType;
    /**
     * return the current editor value
     */
    get value(): string;
    /**
     * Change the editor value
     * @param value - new value to set
     */
    set value(value: string);
    getStoreValue(): any;
    setStoreValue(v: any): void;
    set readOnly(ro: boolean);
    /**
     * select all the text
     */
    selectAll(): void;
    /**
     * select a part of the text
     * @param start
     * @param length
     */
    select(start: number, length?: number): void;
    /**
     * get the selection as { start, length }
     */
    getSelection(): {
        start: number;
        length: number;
    };
}
