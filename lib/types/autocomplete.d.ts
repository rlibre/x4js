/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file autocomplete.ts
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
import { RenderListItem } from "./listview";
import { TextEdit, TextEditProps } from './textedit';
/**
 *
 */
interface AutoCompleteProps extends TextEditProps {
    enumValues: (filter: string) => string[] | Promise<string[]>;
    selectValue?: (text: string) => string;
    renderItem?: RenderListItem;
}
/**
 *
 */
export declare class AutoComplete extends TextEdit<AutoCompleteProps> {
    private m_popup;
    private m_popvis;
    private m_needval;
    private m_lockpop;
    constructor(props: AutoCompleteProps);
    _onKey(e: KeyboardEvent): void;
    private _onChange;
    componentDisposed(): void;
    showPopup(show?: boolean): void;
    /**
     * display the popup
     */
    private _showPopup;
    protected _validate(value: string): boolean;
    validate(): boolean;
    private _checkFocus;
    private _hidePopup;
    private _onFocus;
    isPopupVisible(): boolean;
}
export {};
