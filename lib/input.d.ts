/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file input.ts
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
