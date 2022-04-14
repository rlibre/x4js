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

import { Component, CProps, CEventMap } from './component'
import { EvChange, EventCallback } from './x4_events'
import { asap } from './tools'

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

export class TextArea extends Component<TextAreaProps, TextAreaEventMap> {

	constructor(props: TextAreaProps) {
		super(props);

		this.mapPropEvents( props, 'change' );
	}

	
	/** @ignore */
	render(props: TextAreaProps) {

		props.text = props.text ?? '';

		this.setAttribute('tabindex', props.tabIndex ?? 0);
		if( props.spellcheck===false ) {
			this.setAttribute('spellcheck', 'false' );
		}

		if (props.readOnly !== undefined) {
			this.setAttribute('readonly', props.readOnly);
		}

		if (props.rows) {
			this.setAttribute('rows', props.rows);
		}

		if (props.placeHolder) {
			this.setAttribute('placeholder', props.placeHolder);
		}

		if (props.autoFocus) {
			this.setAttribute('autofocus', props.autoFocus);
		}

		if (props.name) {
			this.setAttribute('name', props.name);
		}

		if (props.autoGrow) {
			this.setProp('autoGrow', true);
			this.setAttribute('rows', this._calcHeight(props.text));
			this.setDomEvent('keydown', () => {
				asap( ()=>this._updateHeight());
			});
		}

		// avoid going to next element on enter
		this.setDomEvent('keydown', (e: KeyboardEvent) => {
			e.stopPropagation();
		});

		this.setDomEvent('input', () => this._change());
		this.setProp('tag', 'textarea');
	}

	private _change() {
		this.emit('change', EvChange(this.value));
	}

	componentCreated() {
		this.value = this.m_props.text;
	}

	get value(): string {

		if (this.dom) {
			return (<HTMLTextAreaElement>this.dom).value;
		}

		return this.m_props.text;
	}

	set value(t: string) {
		this.m_props.text = t ?? '';

		if (this.dom) {
			(<HTMLTextAreaElement>this.dom).value = this.m_props.text;

			if (this.m_props.autoGrow) {
				this.setAttribute('rows', this._calcHeight(this.m_props.text));
			}
		}
	}

	private _calcHeight(text: string): number {
		return 1 + (text.match(/\n/g) || []).length;
	}

	private _updateHeight() {
		const text = this.value;
		const lines = this._calcHeight(text);

		if (this.getData('lines') != lines) {
			this.setAttribute('rows', lines);
			this.setData('lines', lines);
		}
	}

	/**
	 * insert text at cursor position
	 */

	public insertText(text) {
		if (this.dom) {
			let dom = (<HTMLTextAreaElement>this.dom);

			let start = dom.selectionStart;
			dom.setRangeText(text);
			dom.selectionStart = start;
			dom.selectionEnd = start + text.length;
		}
	}
	

	public getStoreValue( ): any {
		return this.value;
	}

	public setStoreValue( value: any ) {
		this.value = value;
	}
}













