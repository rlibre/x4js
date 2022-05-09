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
		let icon = props.icon ?? 'cls(far fa-circle-exclamation)';	// todo: resolve that
		props.icon = undefined;

		let buttons: FormButtons = props.buttons === undefined ? ['ok'] : props.buttons;
		props.buttons = undefined;

		super(props);

		let msg = props.message;

		this.form.updateContent(new HLayout({
			style: { padding: 8 },
			content: [
				new Icon({ cls: 'icon', icon }),
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
