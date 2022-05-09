/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textarea.ts
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
interface TextAreaEventMap extends CEventMap {
    change: EvChange;
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
    private _calcHeight;
    private _updateHeight;
    /**
     * insert text at cursor position
     */
    insertText(text: any): void;
    getStoreValue(): any;
    setStoreValue(value: any): void;
}
export {};
