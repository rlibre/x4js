/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file checkbox.ts
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

import { CEventMap, Component, CProps } from './component'
import { EvChange, EventCallback } from './x4events'
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
	slider?: boolean;

	labelWidth?: number; // <0 mean flex value
	labelAlign?: 'left' | 'right';
	align?: 'left' | 'right';

	change?: EventCallback<EvChange>;
}

/**
 * Standard CheckBox
 */

export class CheckBox extends Component<CheckBoxProps, CheckBoxEventMap> {

	constructor(props: CheckBoxProps) {

		super(props);

		this.setDomEvent('focus', () => this._setFocus());
		this.mapPropEvents( props, 'change' );

		if( props.slider ) {
			this.addClass( 'slider' );
		}
	}

	/** @ignore */
	render(props: CheckBoxProps) {

		// checkbox

		let labelWidth = props.labelWidth ?? -1;
		let uid = '__cb_' + this.uid;

		this.setTag( 'label');
		this.addClass('@hlayout');
		this.addClass(props.align ?? 'left');
		
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
			props.slider ? new Component( { cls: '@slide-el' } ) : null,
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
			}),
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

