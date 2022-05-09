/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file textedit.ts
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

import { Component, EvFocus, HtmlString } from './component'
import { Input, InputProps, InputEventMap } from './input'
import { IconID } from './icon'
import { Button } from './button'
import { HLayout } from './layout'
import { Label } from './label'
import { PopupCalendar } from './calendar'
import { sprintf, parseIntlDate, formatIntlDate } from './tools';
import { Tooltip } from './tooltips'
import { EvClick, EvChange, EventCallback } from './x4_events';

import { _tr } from './i18n'

// throw in case of error
// return the corrected
type ValidationFunction = (value: string) => string;

/** @ignore */
const reEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// ============================================================================
// [TEXTEDIT]
// ============================================================================

interface TextEditEventMap extends InputEventMap  {
	click: EvClick;
	change: EvChange;
	focus: EvFocus;
}

export interface TextEditProps extends InputProps<TextEditEventMap> {
	label?: string | HtmlString;
	labelWidth?: number;	// <0 for flex -> -3 mean flex: 3
	labelAlign?: 'left' | 'right' | 'top';
	required?: boolean;
	spellcheck?: boolean;
	icon?: IconID;
	pattern?: string;
	uppercase?: boolean;
	format?: string | 'native'; // default store format on type date. 
	// by default mysql format without time 'YYYY-MM-DD'
	// use 'native' to work on real Date object (get/set value)

	gadgets?: Component[];

	validator?: ValidationFunction;

	change?: EventCallback<EvChange>;	// shortcut to events: { change: ... }
	click?: EventCallback<EvClick>;		// shortcut to events: { click: ... }
	focus?: EventCallback<EvFocus>;		// shortcut to events: { focus: ... }
}



/**
 * TextEdit is a single line editor, it can have a label and an error descriptor.
 */

export class TextEdit<T extends TextEditProps = TextEditProps> extends Component<TextEditProps, TextEditEventMap> {

	private m_cal_popup: PopupCalendar;
	protected m_ui_input: Input;
	private m_error_tip: Tooltip;

	constructor(props: TextEditProps) {
		super(props);
		this.addClass( '@hlayout' );
		this.mapPropEvents( props, 'change', 'click', 'focus' );
	}

	componentCreated() {
		super.componentCreated( );

		if (this.m_props.autoFocus) {
			this.focus();
		}
	}

	componentDisposed() {
		if (this.m_error_tip) {
			this.m_error_tip.dispose();
		}

		super.componentDisposed();
	}

	focus() {
		this.m_ui_input.focus();
	}

	/** @ignore */
	render(props: TextEditProps) {

		let eprops: InputProps = {
			flex: 1,
			dom_events: {
				focus: ( ) => this._focus( ),
				blur: ( ) => this._blur( ),
				input: ( ) => this._change( )
			},
			value: props.value,
			name: props.name,
			type: props.type,
			placeHolder: props.placeHolder,
			autoFocus: props.autoFocus,
			readOnly: props.readOnly,
			value_hook: props.value_hook,
			uppercase: props.uppercase,
			spellcheck: props.spellcheck,
			tabIndex: props.tabIndex === undefined ? true : props.tabIndex,
			attrs: props.attrs,
			min: props.min,
			max: props.max,
		};

		// date is handled manually with popupcalendar

		if (props.type == 'date') {
			props.format = props.format ?? 'Y-M-D';
			eprops.type = 'text';

			let def_hook = {
				get: ( ) => this._date_get_hook(),
				set: (e) => this._date_set_hook(e)
			}

			eprops.value_hook = props.value_hook ?? def_hook;
		}

		this.m_ui_input = new Input(eprops);

		//	button
		let button = undefined;
		if (props.icon) {
			button = new Button({
				icon: props.icon,
				click: () => this._btnClick(),
				tabIndex: false
			});
		}
		else if (props.type == 'date') {

			button = new Button({
				cls: 'gadget',
				icon: 'cls(far fa-calendar-days)',	// todo: resolve that
				tabIndex: false,
				click: () => this._showDatePicker(button)
			});

			if (!props.validator) {
				props.validator = this._date_validator;
			}
		}

		let ag = props.gadgets ?? [];
		ag.forEach( b => {
			b.addClass( 'gadget' );
		});

		let gadgets = [button, ...ag];

		this.setClass('@required', props.required);
		if (props.gadgets && props.gadgets.length) {
			this.addClass('with-gadgets');
		}

		let width = undefined,
			flex = undefined,
			labelWidth = props.labelWidth;

		if (labelWidth > 0) {
			width = labelWidth;
		}

		if (labelWidth < 0) {
			flex = -labelWidth;
		}

		let label = undefined;
		let labelAlign = props.labelAlign;
		let top = false;

		if (props.label) {

			if (labelAlign == 'top') {
				labelAlign = 'left';
				top = true;
				flex = 1;
			}

			label = new Label({
				ref: 'label',
				tag: 'label',
				cls: 'label1' + (props.label ? '' : ' @hidden'),	// todo: why 'label1' class name ?
				text: props.label ?? '',
				width,
				flex,
				align: labelAlign
			});
		}

		if (top) {
			this.removeClass('@hlayout');
			this.addClass('@vlayout vertical');

			this.setContent([
				label,
				new HLayout({ width, content: [this.m_ui_input, ...gadgets] })
			]);
		}
		else {
			this.addClass('@hlayout');
			this.setContent([label, this.m_ui_input, ...gadgets]);
		}
	}

	enable(ena?: boolean) {
		if (ena === true) {
			this.m_ui_input.enable();
		}

		super.enable(ena);
	}

	disable() {
		this.m_ui_input.disable();
		super.disable();
	}

	private _btnClick() {
		this.emit('click', EvClick(this.value) );
	}

	/**
	 * select the value format for input/output on textedit of type date
	 * cf. formatIntlDate / parseIntlDate
	 * @param fmt 
	 */
	public setDateStoreFormat(fmt: string) {
		this.m_props.format = fmt;
	}

	public setStoreValue(value: any) {
		this.m_ui_input.setStoreValue(value);
	}

	public getStoreValue(): any {
		return this.m_ui_input.getStoreValue();
	}

	private _date_get_hook() {
		let date = parseIntlDate(this.value);
		let props = this.m_props;
		if (props.format == 'native') {
			return date;
		}
		else {
			return date ? formatIntlDate(date, props.format) : null;
		}
	}

	private _date_set_hook(dte) {
		let props = this.m_props;

		if (props.format == 'native') {
			this.value = formatIntlDate(dte);
		}
		else if (dte) {
			let date = parseIntlDate(dte, props.format);
			this.value = formatIntlDate(date);
		}
		else {
			this.value = '';
		}
	}

	public showError(text: string) {

		if (!this.m_error_tip) {
			this.m_error_tip = new Tooltip({ cls: 'error' });
			document.body.appendChild(this.m_error_tip._build());
		}

		let rc = this.m_ui_input.getBoundingRect();

		this.m_error_tip.text = text;
		this.m_error_tip.displayAt(rc.right, rc.top, 'top left');
		this.addClass('@error');
	}

	public clearError() {

		if (this.m_error_tip) {
			this.m_error_tip.hide();
			this.removeClass('@error');
		}
	}

	public get value(): string {
		if (this.m_ui_input) {
			return this.m_ui_input.value;
		}
		else {
			return this.m_props.value;
		}
	}

	public set value(value: string) {
		if (this.m_ui_input) {
			this.m_ui_input.value = value;
		}
		else {
			this.m_props.value = value;
		}
	}

	/**
	 * select all the text
	 */

	public selectAll() {
		this.m_ui_input.selectAll();
	}

	public select(start: number, length: number = 9999): void {
		this.m_ui_input.select(start, length);
	}

	public getSelection() {
		return this.m_ui_input.getSelection();
	}

	set readOnly(ro: boolean) {
		this.m_ui_input.readOnly = ro;
	}

	get label() {
		return this.itemWithRef<Label>('label')?.text;
	}

	set label(text) {
		this.itemWithRef<Label>('label').text = text;
	}

	/**
	 * content changed
	 * todo: should move into Input
	 */

	private _change() {
		let value = this.m_ui_input.value;
		this.emit('change', EvChange(value));
	}

	/**
	 * getting focus
	 */

	private _focus() {
		this.clearError();
		this.emit('focus', EvFocus(true));
	}

	/**
	 * loosing focus
	 * @param value 
	 */

	private _blur() {
		this._validate(this.m_ui_input.value);
		this.emit('focus', EvFocus(false));
	}

	/**
	 * todo: should move into Input
	 * @returns 
	 */
	public validate(): boolean {
		return this._validate(this.value);
	}

	private _validate(value: string): boolean {
		let props = this.m_props;
		let update = false;

		if (props.required && value.length == 0) {
			this.showError(_tr.global.required_field);
			return false;
		}

		if (value != '') {
			let pattern = this.getAttribute('pattern');
			if (pattern) {
				let re = new RegExp(pattern);
				if (re && !re.test(value)) {
					this.showError(_tr.global.invalid_format);
					return false;
				}
			}

			if (props.type == 'email') {
				if (!reEmail.test(value.toLowerCase())) {
					this.showError(_tr.global.invalid_email);
					return false;
				}
			}
			else if (props.type == 'number') {

				const v = parseFloat(value);
				if (isNaN(v)) {
					this.showError(_tr.global.invalid_number);
					return false;
				}

				let min = parseFloat(this.m_ui_input.getAttribute('min'));
				if (min !== undefined && v < min) {
					value = '' + min;
					update = true;
				}

				let max = parseFloat(this.m_ui_input.getAttribute('max'));
				if (max !== undefined && v > max) {
					value = '' + max;
					update = true;
				}
			}
		}


		if (props.validator) {
			try {
				this.value = props.validator(value);
			}
			catch (err) {
				this.showError(err instanceof Error ? err.message : err);
				return false;
			}
		}
		else if (update) {
			this.value = value;
		}

		return true;
	}

	_date_validator(value: string): string {

		value = value.trim();
		if (value == '') {
			return '';
		}

		let date: Date;
		if (value == '@') {
			date = new Date();
		}
		else {
			date = parseIntlDate(value);
			if (!date) {
				throw sprintf(_tr.global.invalid_date, _tr.global.date_format);
			}
		}

		return formatIntlDate(date);
	}


	//onKeyDown( e ) {
	//    if( this.readOnly ) {
	//        if( this.type=='date' && (e.key==' ' || e.key=='Enter') ) {
	//            this.showDatePicker( );
	//            e.stopPropagation( );
	//            e.preventDefault( );
	//        }
	//    }
	//}

	//onClick( e ) {
	//    if( this.readOnly ) {
	//        if( this.type=='date' ) {
	//            this.showDatePicker( );
	//            e.stopPropagation( );
	//            e.preventDefault( );
	//        }
	//    }
	//}

	private _showDatePicker(btn: Component) {

		if (!this.m_cal_popup) {
			this.m_cal_popup = new PopupCalendar({
				change: (ev: EvChange) => {
					this.value = formatIntlDate(ev.value as Date);
					this.m_cal_popup.close();
				}
			});
		}

		let rc = this.m_ui_input.getBoundingRect();
		this.m_cal_popup.displayAt(rc.left, rc.bottom, 'top left');
	}

	get input() {
		return this.m_ui_input;
	}

	get type() {
		return this.m_props.type;
	}
}
