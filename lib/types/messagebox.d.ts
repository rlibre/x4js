/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file messagebox.ts
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
    static showAsync(props: string | HtmlString | MessageBoxProps): Promise<string>;
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
