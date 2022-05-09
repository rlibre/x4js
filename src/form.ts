/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file form.ts
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

import { Component, Container, CProps, ContainerEventMap, ComponentContent, flyWrap } from './component'
import { HLayout, VLayout } from './layout'
import { Button } from './button'
import { Input } from './input'
import { TextEdit } from './textedit'
import { ajaxRequest, RequestProps } from './request'
import { EventCallback } from './x4_events'
import { EvBtnClick } from './dialog'

import { _tr } from './i18n'

// ============================================================================
// [FORM]
// ============================================================================

export type FormBtn = 'ok' | 'cancel' | 'ignore' | 'yes' | 'no' | 'close' | 'save' | 'dontsave';
export type FormButtons = (FormBtn | Button | Component)[];

export interface FormEventMap extends ContainerEventMap {
	btnClick?: EvBtnClick;
}

export interface FormProps extends CProps<FormEventMap> {
	disableSuggestions?: boolean;
	buttons?: FormButtons;
	btnClick?: EventCallback<EvBtnClick>;	// shortcut for events: { btnClick: ... }
}

/**
 * 
 */

export class Form extends VLayout<FormProps, FormEventMap>
{
	protected m_height: string | number;
	protected m_container: Container;
	protected m_buttons: HLayout;
	protected m_dirty: boolean;
	protected m_watchChanges: boolean;

	constructor(props: FormProps) {

		let content = props.content;
		props.content = null;

		// save height, because real form height is 'height' PLUS button bar height
		let height = props.height;
		props.height = undefined;

		super(props);

		this.setProp('tag', props.disableSuggestions ? 'section' : 'form');
		this.mapPropEvents(props, 'btnClick');
		this.updateContent(content, props.buttons, height);

		this.m_dirty = false;
		this.m_watchChanges = false;
	}

	/**
	 * returns the container object
	 */

	get container(): Container {
		return this.m_container;
	}

	/**
	 * 
	 */

	override componentCreated(): void {
		super.componentCreated()
		if (this.m_watchChanges) {
			this.watchChanges();
		}
	}

	/**
	 * 
	 */

	public updateContent(items: ComponentContent, buttons: FormButtons, height: string | number = 0) {

		if (height) {
			// keep height for next time
			this.m_height = height;
		}

		this._makeButtons(buttons);

		let content = [
			this.m_container = new VLayout({
				cls: 'container',
				height: this.m_height,
				content: items
			}),
			this.m_buttons,
		];

		super.setContent(content);
	}

	/**
	 * 
	 * @param els 
	 * @param refreshAll 
	 */

	setContent(els: ComponentContent, refreshAll = true) {
		this.m_container.setContent(els, refreshAll);
	}

	/**
	 * 
	 * @param buttons 
	 */
	setButtons(buttons: FormButtons) {
		this._makeButtons(buttons);
	}

	/**
	 * enable a button by it's name
	 */

	enableButton(name: string, enable = true) {
		let button = this.getButton(name);
		if (button) {
			button.enable(enable);
		}
	}

	/**
	 * return a button by it's name
	 * @param name 
	 */

	getButton(name: string) {
		let button = this.m_buttons?.itemWithRef<Button>('@' + name);
		return button;
	}


	/**
	 * 
	 */

	private _makeButtons(buttons?: FormButtons): void {

		if (!this.m_buttons) {
			this.m_buttons = new HLayout({
				cls: 'footer',
				ref: 'buttons',
			});
		}

		let btns: Component[] = [];

		if (buttons) {
			for (let b of buttons) {
				if (b instanceof Component) {
					btns.push(b);
				}
				else {
					switch (b) {
						case 'ok': { btns.push(new Button({ ref: '@' + b, text: _tr.global.ok, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'cancel': { btns.push(new Button({ ref: '@' + b, text: _tr.global.cancel, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'ignore': { btns.push(new Button({ ref: '@' + b, text: _tr.global.ignore, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'yes': { btns.push(new Button({ ref: '@' + b, text: _tr.global.yes, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'no': { btns.push(new Button({ ref: '@' + b, text: _tr.global.no, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'close': { btns.push(new Button({ ref: '@' + b, text: _tr.global.close, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'save': { btns.push(new Button({ ref: '@' + b, text: _tr.global.save, click: () => { this._click(<FormBtn>b); } })); break; }
						case 'dontsave': { btns.push(new Button({ ref: '@' + b, text: _tr.global.dontsave, click: () => { this._click(<FormBtn>b); } })); break; }
					}
				}
			}
		}

		if (btns.length == 1) {
			btns[0].setAttribute('autofocus', true);
		}

		this.m_buttons.setContent(btns);
	}

	/**
	 * 
	 */

	public validate() {
		let inputs = this.queryAll('input'),
			result = true;

		for (let i = 0; i < inputs.length; i++) {
			let input = Component.getElement(inputs[i], TextEdit);
			if (input && !input.validate()) {
				result = false;
			}
		}

		return result;
	}

	/**
	 * 
	 */

	private _click(btn: FormBtn) {
		this.emit('btnClick', EvBtnClick(btn));
	}

	/**
	 * replacement for HTMLFormElement.elements
	 * as chrome shows suggestions on form elements even if we ask him (not to do that)
	 * we removed <form> element.
	 * so we have to get children by hand
	 */

	private _getElements() {
		console.assert(!!this.dom);
		const els = this.queryAll('[name]');
		return els;
	}

	/**
	 * 
	 */

	public setValues(values: any) {

		let elements = this._getElements();
		for (let e = 0; e < elements.length; e++) {

			let input = <HTMLInputElement>elements[e];

			let item = Component.getElement(input);
			if (!item.hasAttribute("name")) {
				continue;
			}

			let name = item.getAttribute('name'),
				type = item.getAttribute('type');

			if (values[name] !== undefined) {
				(<Input>item).setStoreValue(values[name]);
			}
		}

		this.setDirty(false);
	}


	/**
	 * values are not escaped
	 * checkbox set true when checked
	 * radio set value when checked
	 */

	public getValues(): any {
		let elements = this._getElements();
		let result = {};

		for (let e = 0; e < elements.length; e++) {

			let el = <HTMLElement>elements[e];
			let item = <Input>Component.getElement(el);
			if (!item.hasAttribute("name")) {
				continue;
			}

			let name = item.getAttribute('name'),
				value = item.getStoreValue();

			if (value !== undefined) {
				result[name] = value;
			}
		}

		return result;
	}

	/**
	 * send the query to the desired handler
	 */

	public submit(cfg: RequestProps, cbvalidation: Function) {

		if (!this.validate()) {
			return false;
		}

		let values = this.getValues();
		if (cbvalidation) {
			if (!cbvalidation(values)) {
				return false;
			}
		}

		let form = new FormData();
		for (let n in values) {
			if (values.hasOwnProperty(n)) {
				form.append(n, values[n] === undefined ? '' : values[n]);
			}
		}

		cfg.params = form;
		return ajaxRequest(cfg);
	}

	/**
	 * 
	 */

	watchChanges() {
		if (this.dom) {
			const els = this.queryAll('input[name], textarea[name]');
			els.forEach(el => {
				flyWrap<Input>(el).setDomEvent('input', () => {
					this.setDirty();
				});
			});

			this.m_watchChanges = false;
		}
		else {
			this.m_watchChanges = true;
		}
	}

	setDirty(set = true) {
		this.m_dirty = set;
	}

	isDirty() {
		return this.m_dirty;
	}
}