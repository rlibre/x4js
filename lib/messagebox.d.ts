/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file messagebox.ts
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
import { Dialog, DialogProps } from './dialog';
import { HtmlString } from './tools';
import { IconID } from './icon';
import { Label } from './label';
import { TextEdit } from './textedit';
/**
 * [ MESSAGEBOX ] -----------------------------------------------------------------
 */
export interface MessageBoxProps extends DialogProps {
    message: string | HtmlString;
    click: (button: string) => void;
}
export declare class MessageBox extends Dialog<MessageBoxProps> {
    m_label: Label;
    constructor(props: MessageBoxProps);
    set text(txt: string | HtmlString);
    /**
     * display a messagebox
     */
    static show(props: string | HtmlString | MessageBoxProps): MessageBox;
    /**
     * display an alert message
     */
    static alert(text: string | HtmlString, title?: string): void;
}
export interface PromptBoxProps extends DialogProps {
    message: string | HtmlString;
    value?: string;
    icon?: IconID;
    click: (value: string) => void;
}
export declare class PromptDialogBox extends Dialog<PromptBoxProps> {
    m_edit: TextEdit;
    constructor(props: PromptBoxProps);
    set text(txt: string | HtmlString);
    /**
     * display a messagebox
     */
    static show(props: string | HtmlString | PromptBoxProps, inputCallback?: (input: string) => void): PromptBoxProps;
}
