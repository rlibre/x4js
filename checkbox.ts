/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file checkbox.ts
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

import { CEventMap, Component, CProps } from './component'
import { EvChange, EventCallback } from './x4_events'
import { HtmlString } from './tools'

import { Input } from './input'
import { Label } from './label'

// ============================================================================
// [CHECKBOX]
// ============================================================================

interface CheckBoxEventMap extends CEventMap {
	change?: EvChange;
}

interface CheckBoxProps extends CProps<CheckBoxEventMap> {
	name?: string;

	text?: string | HtmlString;

	checked?: boolean;
	value?: string;

	labelWidth?: number; // <0 mean flex value
	labelAlign?: 'left' | 'right';
	align?: 'left' | 'right';

	change: EventCallback<EvChange>;
}

/**
 * Standard CheckBox
 */

export class CheckBox extends Component<CheckBoxProps, CheckBoxEventMap> {

	constructor(props: CheckBoxProps) {

		super(props);

		this.setDomEvent('focus', () => this._setFocus());
		this.mapPropEvents( props, 'change' );
	}

	/** @ignore */
	render(props: CheckBoxProps) {

		// checkbox

		let labelWidth = props.labelWidth ?? -1;
		let uid = '__cb_' + this.uid;

		this.addClass('@hlayout');
		this.addClass(props.align ?? 'left');
		this.setProp('tag', 'label');

		this.setContent([
			new Input({
				ref: 'input',
				type: 'checkbox',
				name: props.name,
				id: uid,
				tabIndex: props.tabIndex,
				value: props.value ?? 'on',
				attrs: {
					checked: props.checked ? '' : undefined
				},
				dom_events: {
					change: this._change.bind(this),
				}
			}),
			new Label({
				text: props.text ?? '',
				width: labelWidth < 0 ? undefined : labelWidth,
				flex: labelWidth < 0 ? -labelWidth : undefined,
				align: props.labelAlign ?? 'left',
				style: {
					order: props.align == 'right' ? -1 : 1,
				},
				attrs: {
					"for": uid
				}
			})
		]);
	}

	/**
	 * check state changed
	 */

	private _change() {
		this.emit('change', EvChange(this.check));
	}

	/**
	 * focus gained/loosed
	 */

	private _setFocus() {
		let input = this.itemWithRef<Input>('input');
		input.focus();
	}

	/**
	 * @return the checked value
	 */

	public get check() {
		if (this.dom) {
			let input = this.itemWithRef<Input>('input');
			let dom = input.dom as HTMLInputElement;
			return dom.checked;
		}

		return this.m_props.checked;
	}

	/**
	 * change the checked value
	 * @param {boolean} ck new checked value	
	 */

	public set check(ck: boolean) {

		if (this.dom) {
			let input = this.itemWithRef<Input>('input');
			const dom = input.dom as HTMLInputElement;
			if (dom) {
				dom.checked = ck;
			}
		}

		this.m_props.checked = ck;
		//this._change();	// todo: is it needed when changed by code ? -> no
	}

	get text() {
		return this.itemWithRef<Label>('label').text;
	}

	set text(text) {
		this.itemWithRef<Label>('label').text = text;
	}

	/**
	 * toggle the checkbox
	 */

	public toggle() {
		this.check = !this.check;
	}
}

