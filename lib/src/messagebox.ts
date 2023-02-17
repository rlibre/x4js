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

import { Dialog, DialogProps, EvBtnClick } from './dialog'
import { FormButtons } from './form'
import { asap, HtmlString, isHtmlString, isString } from './tools'
import { HLayout } from './layout'
import { Icon, IconID } from './icon'
import { Label } from './label'
import { TextEdit } from './textedit'

/**
 * [ MESSAGEBOX ] -----------------------------------------------------------------
 */

export interface MessageBoxProps extends DialogProps {
	message: string | HtmlString;	// always allow html
	click: (button: string) => void;
}

export class MessageBox extends Dialog<MessageBoxProps>
{
	m_label: Label;

	constructor(props: MessageBoxProps) {

		// remove overloaded elements from DialogBoxProps
		let icon = props.icon ?? 'var( --x4-icon-exclamation )';	// todo: resolve that
		props.icon = undefined;

		let buttons: FormButtons = props.buttons === undefined ? ['ok'] : props.buttons;
		props.buttons = undefined;

		super(props);

		let msg = props.message;

		this.form.updateContent(new HLayout({
			style: { padding: 8 },
			content: [
				icon ? new Icon({ cls: 'icon', icon }) : null,
				this.m_label = new Label({ cls: 'text', text: msg, multiline: true })
			]
		}), buttons);

		this.on('btnClick', (ev: EvBtnClick) => {
			// no prevent default -> always close the messagebox
			if (!this.m_props.click) {
				return;
			}

			asap(() => {
				this.m_props.click( ev.button );
			});
		});
	}

	set text(txt: string | HtmlString) {
		this.m_label.text = txt;
	}


	/**
	 * display a messagebox
	 */

	static show(props: string | HtmlString | MessageBoxProps): MessageBox {

		let msg;

		if (isString(props) || isHtmlString(props)) {
			msg = new MessageBox({ message: props, click: () => { } });
		}
		else {
			msg = new MessageBox(props);
		}

		msg.show();
		return msg;
	}

	static async showAsync( props: string | HtmlString | MessageBoxProps): Promise<string> {
		return new Promise( (resolve, reject ) => {
			
			let _props: MessageBoxProps;

			const cb = ( btn: string ) => {
				resolve( btn );
			}

			if (isString(props) || isHtmlString(props)) {
				_props = { message: props, click: cb };
			}
			else {
				_props = { ...props, click: cb };
			}

			const msg = new MessageBox(_props);
			msg.show();
		});
	}

	/**
	 * display an alert message
	 */

	static alert(text: string | HtmlString, title: string = null) {
		new MessageBox({
			cls: 'warning',
			title,
			message: text,
			buttons: ['ok'],
			click: () => { },
		}).show();
	}
}


// :: PrompDialogBox  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export interface PromptBoxProps extends DialogProps {
	message: string | HtmlString;
	value?: string;		// default input value
	icon?: IconID;

	click: (value: string) => void;
}

export class PromptDialogBox extends Dialog<PromptBoxProps> {

	m_edit: TextEdit;

	constructor(props: PromptBoxProps) {

		// remove overloaded elements from DialogBoxProps
		//let icon = props.icon;	// ?? 'cls(far fa-comment-check)';	// todo: resolve that
		//props.icon = undefined;
		props.buttons = undefined;

		props.width = props.width ?? 500;
		super(props);

		this.form.updateContent(
			new HLayout({
				cls: 'panel',
				content: [
					//icon ? new Icon({
					//	cls: 'icon',
					//	icon: icon
					//}) : null,
					this.m_edit = new TextEdit({
						flex: 1,
						autoFocus: true,
						label: props.message,
						value: props.value
					}),
				]
			}),
			['ok', 'cancel']
		);

		if (props.click) {
			this.on('btnClick', (ev: EvBtnClick) => {

				if (ev.button === 'ok') {
					// no prevent default -> always close the messagebox
					// asap to allow
					asap(() => {
						this.m_props.click(this.m_edit.value);
					});
				}
			});
		}
	}

	set text(txt: string | HtmlString) {
		this.m_edit.label = txt;
	}

	/**
	 * display a messagebox
	 */

	static show(props: string | HtmlString | PromptBoxProps, inputCallback?: (input: string) => void): PromptBoxProps {

		let msg;

		if (isString(props) || isHtmlString(props)) {
			msg = new PromptDialogBox({ message: props, click: inputCallback });
		}
		else {
			msg = new PromptDialogBox(props);
		}

		msg.show();
		return msg;
	}
}
