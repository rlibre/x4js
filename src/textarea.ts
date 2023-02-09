/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file textarea.ts
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

import { Component, CProps, CEventMap } from './component'
import { EvChange, EventCallback } from './x4events'
import { asap } from './tools'

interface TextAreaEventMap extends CEventMap {
	change: EvChange;
}

interface Selection {
	start: number;
	end: number;
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
			this.m_props.autoGrow = true;
			this.setAttribute('rows', this._calcHeight(props.text));
			this.setDomEvent('keydown', () => {
				asap( ()=>this._updateHeight());
			});
		}

		// avoid going to next element on enter
		this.setDomEvent('keydown', (e: KeyboardEvent) => {
			e.stopPropagation();
		});

		this.setTag( 'textarea');
		this.setDomEvent('input', () => this._change());
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
	
	get text( ): string {
		return this.value;
	}

	set text( text: string ) {
		this.value = text;
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
	 * @deprected use appendText
	 * insert text at cursor position
	 */

	public insertText(text) {
		this.appendText( text );
	}

	/**
	 * append the text
	 */

	public appendText( text ) {
		if (this.dom) {
			let dom = (<HTMLTextAreaElement>this.dom);
			let end = dom.selectionEnd;
			dom.setRangeText(text,end,end,"end");
		}
	}

	public replaceText( text ) {
		if (this.dom) {
			let dom = (<HTMLTextAreaElement>this.dom);
			dom.setRangeText(text);
		}
	}

	public getSelection( ) : Selection {
		if (this.dom) {
			let dom = (<HTMLTextAreaElement>this.dom);
			return { start: dom.selectionStart, end: dom.selectionEnd };
		}
		else {
			return {start: 0, end: 0 };
		}
	}

	public setSelection( sel : Selection ) {
		if (this.dom) {
			let dom = (<HTMLTextAreaElement>this.dom);
			if( sel.start!==undefined ) {
				dom.selectionStart = sel.start;
			}

			if( sel.end!==undefined ) {
				dom.selectionEnd = sel.end;
			}
		}
	}
	
	public getStoreValue( ): any {
		return this.value;
	}

	public setStoreValue( value: any ) {
		this.value = value;
	}
}













