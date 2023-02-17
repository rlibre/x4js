/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file dialog.ts
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

import { x4document } from './x4dom'

import { Popup, PopupProps, PopupEventMap, EvMove } from './popup'
import { Icon, IconID } from './icon'
import { HLayout } from './layout'
import { Label } from './label'
import { Form, FormButtons } from './form'
import { Component, ComponentContent, EvSize, flyWrap } from './component'
import { BasicEvent, EventCallback } from './x4events'
import { Rect, getMousePos, isFunction, isTouchDevice, isString, Size } from './tools'

interface Geometry {
	left: number;
	top: number;
	width: number;
	height: number;
	minimized: boolean;
	maximized: boolean;
}

// ============================================================================
// [DIALOG]
// ============================================================================


export interface EvClose extends BasicEvent {
}

export interface EvBtnClick extends BasicEvent {
	button: string;
}

export function EvBtnClick(button: string) {
	return BasicEvent<EvBtnClick>({ button });
}


export interface DialogBoxEventMap extends PopupEventMap {
	close: EvClose;
	btnClick: EvBtnClick;
}

export type InitFormCallback = () => Form;

export interface DialogProps<E extends DialogBoxEventMap = DialogBoxEventMap> extends PopupProps<E> {
	title?: string;
	icon?: IconID;
	buttons?: FormButtons;
	
	btnClick?: EventCallback<EvBtnClick>;

	closable?: boolean;
	movable?: boolean;
	maximized?: boolean;
	maximizable?: boolean;
	minimizable?: boolean;
	autoClose?: boolean;	// if true, close the dialog when a button is clicked

	width?: number;			// when you specify a width here, this is the minimal FORM content width
	height?: number;		// when you specify a width here, this is the minimal FORM content heigt
	dlgWidth?: number;		// this is the prefered initial dialog width in percent of screen
	dlgHeight?: number;		// this is the prefered initial dialog height in percent of screen

	form?: Form | InitFormCallback;
	disableSuggestions?: boolean;
}

/**
 * Standard dialog class
 */

export class Dialog<P extends DialogProps = DialogProps, E extends DialogBoxEventMap = DialogBoxEventMap> extends Popup<P, E>
{
	protected m_icon: IconID;
	protected m_title: string;
	protected m_form: Form;
	protected m_buttons: FormButtons;
	protected m_closable: boolean;
	protected m_movable: boolean;
	protected m_maximized: boolean;
	protected m_minimized: boolean;
	protected m_maximizable: boolean;
	protected m_minimizable: boolean;

	protected m_minFormSize: Size;

	protected m_rc_max: Rect;
	protected m_rc_min: Rect;

	protected m_el_title: Component;
	protected m_last_down: number;
	protected m_auto_close: boolean;

	protected m_ui_title: Label;
	protected m_form_cb: InitFormCallback;

	constructor(props: P) {

		let content = props.content;
		props.content = null;

		let width = props.width;
		let height = props.height;

		props.width = undefined;
		props.height = undefined;

		super(props);

		this.m_minFormSize = { width, height };

		this.enableMask(true);

		if (props.form) {
			if (!isFunction(props.form)) {
				this.m_form = props.form;
				this.m_form.on('btnClick', (e) => this._handleClick(e));
			}
			else {
				this.m_form_cb = props.form;
			}
		}
		else {
			this.m_form = new Form({
				content,
				buttons: props.buttons,
				disableSuggestions: props.disableSuggestions,
				btnClick: (e) => this._handleClick(e)
			});
		}

		this.m_movable = props.movable;
		this.m_auto_close = props.autoClose ?? true;

		this.m_icon = props.icon;
		this.m_title = props.title;
		this.m_buttons = props.buttons ?? null;
		this.m_closable = props.closable ?? false;
		this.m_last_down = 0;

		this.on('size', (ev: EvSize) => {
			this.addClass('@resized');
			this.m_form.setStyleValue('width', null);
			this.m_form.setStyleValue('height', null);
		});

		this.m_maximized = false;
		this.m_minimized = false;
		this.m_maximizable = false;
		this.m_minimizable = false;

		if (props.maximizable !== undefined) {
			this.m_maximizable = props.maximizable;
		}

		if (props.minimizable !== undefined) {
			this.m_minimizable = props.minimizable;
		}

		if (props.maximized == true) {
			this.m_maximizable = true;
		}

		if( props.btnClick ) {
			this.on( 'btnClick', props.btnClick );
		}
	}

	/**
	 * 
	 */
	
	componentCreated() // override
	{
		super.componentCreated();

		if( this.m_minFormSize.width ) {
			this.m_form.setStyle( {
				minWidth: this.m_minFormSize.width,
				width: this.m_minFormSize.width 
			} );
		}

		if( this.m_minFormSize.height ) {
			this.m_form.setStyle( {
				minHeight: this.m_minFormSize.height,
				height: this.m_minFormSize.height 
			});
		}
			
		const rc = this.getBoundingRect( );
		this.setStyleValue( 'min-width', rc.width );
		this.setStyleValue( 'min-height', rc.height );

		this.setStyleValue( 'width', rc.width );
		this.setStyleValue( 'height', rc.height );
		
		if( this.m_props.dlgWidth ) {
			this.setStyleValue( 'width', this.m_props.dlgWidth+'%' );
		}

		if( this.m_props.dlgHeight ) {
			this.setStyleValue( 'height', this.m_props.dlgHeight+'%' );
		}
		
		this.addClass('@resized');

		if( this.m_el_title ) {
			this.m_el_title.setStyleValue( "width", "auto" );
		}

		if (this.m_props.maximized) {
			this._maximize();
			this.emit('size', EvSize(null));
		}
		else {
			this.centerOnScreen( );
		}
	}

	/**
	 * 
	 */

	private _handleClick(ev: EvBtnClick) {
		this.emit('btnClick', ev);
		if (!ev.defaultPrevented) {
			this.close();
		}
	}

	/**
	 * restore the geometry
	 */

	setGeometry(geom: Geometry) {

		if (geom.minimized && this.m_minimizable) {
			this._minimize(false);
			this.m_rc_min = new Rect(geom.left, geom.top, geom.width, geom.height);
			this.displayAt(geom.left, geom.top, 'top-left');
		}
		else if (geom.maximized && this.m_maximizable) {
			this._maximize(false);
			this.m_rc_max = new Rect(geom.left, geom.top, geom.width, geom.height);
		}
		else {
			this.setSize(geom.width, geom.height);
			this.displayAt(geom.left, geom.top, 'top-left');
		}
	}

	/**
	 * return the geometry (usefull to save state)
	 */

	getGeometry(): Geometry {

		if (this.m_minimized) {
			return {
				left: this.m_rc_min.left,
				top: this.m_rc_min.top,
				width: this.m_rc_min.width,
				height: this.m_rc_min.height,
				minimized: true,
				maximized: false
			}
		}
		else if (this.m_maximized) {
			return {
				left: this.m_rc_max.left,
				top: this.m_rc_max.top,
				width: this.m_rc_max.width,
				height: this.m_rc_max.height,
				minimized: false,
				maximized: true
			}
		}

		let rc = this.getBoundingRect();

		return {
			left: rc.left,
			top: rc.top,
			width: rc.width,
			height: rc.height,
			minimized: false,
			maximized: false
		};
	}

	/**
	 * resize the dialog
	 * @param width 
	 * @param height 
	 */
	setSize(width: number, height: number) {
		this.setStyle({ width, height });
		this.emit('size', EvSize({ width, height }));
	}

	/** @ignore */
	render() {

		if (this.m_form_cb) {
			this.m_form = this.m_form_cb();
			this.m_form.on('btnClick', (e) => this._handleClick(e));
			this.m_form_cb = null;
		}

		let hasTitle = this.m_icon !== undefined || this.m_closable || this.m_title !== undefined || this.m_movable;
		this.m_el_title = null;

		if (hasTitle) {
			this.m_el_title = new HLayout({
				cls: 'title',
				content: [
					this.m_icon ? new Icon({ icon: this.m_icon }) : null,
					this.m_ui_title = new Label({ flex: 1, text: this.m_title }),
					this.m_minimizable ? new Icon({ cls: 'min-btn', icon: 'var( --x4-icon-window-minimize )', dom_events: { click: () => this._toggleMin() } }) : null,
					this.m_maximizable ? new Icon({ cls: 'max-btn', icon: 'var( --x4-icon-window-maximize )', dom_events: { click: () => this._toggleMax() } }) : null,
					this.m_maximizable ? new Icon({ cls: 'res-btn', icon: 'var( --x4-icon-window-restore )', dom_events: { click: () => this._toggleMax() } }) : null,
					this.m_closable ? new Icon({ cls: 'close-btn', icon: 'var( --x4-icon-rectangle-times )', dom_events: { click: () => this.close() } }) : null,
				]
			});

			if (this.m_movable) {
				if( isTouchDevice() ) {
					this.m_el_title.setDomEvent('touchstart', (e) => this._mouseDown(e));
				}
				else {
					this.m_el_title.setDomEvent('mousedown', (e) => this._mouseDown(e));
				}
			}
		}

		super.setContent([
			this.m_el_title,
			this.m_form
		]);
	}

	/**
	 * change the dialog content
	 * @param els 
	 * @param refreshAll 
	 */

	setContent( els: ComponentContent, refreshAll = true ) {
		this.m_form.setContent( els, refreshAll );
	}

	/**
	 * change the dialog buttons
	 * @param buttons 
	 */

	setButtons( buttons: FormButtons ) {
		this.m_form.setButtons( buttons );
	}

	/**
	 * return the dialog form
	 */

	public get form(): Form {
		return this.m_form;
	}

	/**
	 * close the dialog
	 */

	public close() {
		this.emit( 'close', {} );
		super.close();
	}

	/**
	 * 
	 */
	private _toggleMax() {
		if (!this.m_maximizable) {
			return;
		}

		if (this.m_maximized) {
			this.removeClass('maximized');
			this.setStyle({
				left: this.m_rc_max.left,
				top: this.m_rc_max.top,
				width: this.m_rc_max.width,
				height: this.m_rc_max.height,
			});
			this.m_maximized = false;
			this.emit( 'size', EvSize(null, 'restore'));
		}
		else {
			this._maximize();
			this.emit( 'size', EvSize(null, 'maximize'));
		}
	}

	/**
	 * 
	 */

	private _toggleMin() {
		if (!this.m_minimizable) {
			return;
		}

		if (this.m_minimized) {
			this.removeClass('minimized');
			this.setStyle({
				//left: 	this.m_rc_min.left,
				//top: 	this.m_rc_min.top,
				width: this.m_rc_min.width,
				height: this.m_rc_min.height,
			});
			this.m_minimized = false;
			this.emit('size', EvSize(null, 'restore'));
		}
		else {
			this._minimize();
			this.emit('size', EvSize(null, 'minimize'));
		}
	}

	/**
	 * 
	 */

	private _mouseDown(event: UIEvent) {

		let { x, y } = getMousePos(event, true);

		let wrc = flyWrap(x4document.body).getBoundingRect();
		let rc = this.getBoundingRect(true);
		///let trc = this.m_el_title.getBoundingRect();

		let dx = x - rc.left,
			dy = y - rc.top;

		//let cstyle = this.getComputedStyle();
		//let topw = cstyle.parse('marginTop') + cstyle.parse('paddingTop') + cstyle.parse('borderTopWidth');
		//let botw = cstyle.parse('marginBottom') + cstyle.parse('paddingBottom') + cstyle.parse('borderBottomWidth');
		//let lftw = cstyle.parse('marginLeft') + cstyle.parse('paddingLeft') + cstyle.parse('borderLeftWidth');
		//let rgtw = cstyle.parse('marginRight') + cstyle.parse('paddingRight') + cstyle.parse('borderRightWidth');

		//wrc.top += topw - trc.height;
		//wrc.height -= topw + botw - trc.height;

		//wrc.left += lftw;
		//wrc.width -= lftw + rgtw;

		// custom handling double click
		const now = Date.now();
		const delta = now - this.m_last_down;
		
		if ( this.m_maximizable && delta < 700) {
			this._toggleMax();
			return;
		}

		this.m_last_down = now;
		if (this.m_maximized) {
			// cannot move in max state
			return;
		}

		let __move = (ex, ey) => {
			
			if( ex>wrc.right ) {
				ex = wrc.right;
			}
			else if( ex<wrc.left ) {
				ex = wrc.left;
			}

			if( ey>wrc.bottom ) {
				ey = wrc.bottom;
			}
			else if( ey<wrc.top ) {
				ey = wrc.top;
			}

			let x = ex - dx,
				y = ey - dy;

			//if (x + rc.width < wrc.left) {
			//	x = wrc.left - rc.width;
			//}
			//else if (x > wrc.right) {
			//	x = wrc.right;
			//}
			//
			//if (y < wrc.top) { // title grip is on top
			//	y = wrc.top;
			//}
			//else if (y > wrc.bottom) {
			//	y = wrc.bottom;
			//}

			this.setStyle({
				left: x,
				top: y
			});
		}

		Component.setCapture(this, (ev) => {

			if (ev.type == 'mousemove') {
				let mev = ev as MouseEvent;
				__move(mev.clientX, mev.clientY);
			}
			else if (ev.type == 'touchmove') {
				let tev = ev as TouchEvent;

				if (tev.touches.length == 1) {
					__move(tev.touches[0].clientX, tev.touches[0].clientY);
				}
			}
			else if (ev.type == 'mouseup' || ev.type == 'touchend') {
				Component.releaseCapture();
				this.emit( 'move', EvMove(null));
			}
			else if (ev.type == 'mousedown' || ev.type == 'touchstart') {

			}
		});
	}

	/**
	 * maximize the dialog
	 */

	public maximize() {
		if (!this.m_maximizable || this.m_maximized) {
			return;
		}

		this._maximize();
		this.emit('size', EvSize(null));
	}

	/**
	 * 
	 */

	private _maximize(saveRect = true) {

		if (saveRect) {
			this.m_rc_max = this.getBoundingRect(false);
		}

		this.addClass('maximized');
		this.m_maximized = true;

		this.setStyle({
			left: undefined,
			top: undefined,
			width: undefined,
			height: undefined,
		});
	}

	/**
	 * minimize the dialog
	 */

	public minimize() {
		if (!this.m_minimizable || this.m_minimized) {
			return;
		}

		this._minimize();
		this.emit('size', EvSize(null));
	}

	/**
	 * 
	 */

	private _minimize(saveRect = true) {

		if (saveRect) {
			this.m_rc_min = this.getBoundingRect(false);
		}

		this.addClass('minimized');
		this.m_minimized = true;

		this.setStyle({
			//left: undefined,
			//top: undefined,
			width: undefined,
			height: undefined,
		});


	}

	/**
	 * change the dialog title
	 */

	set title(title: string) {
		this.m_title = title;
		if (this.m_ui_title) {
			this.m_ui_title.text = title;
		}
	}

	itemWithName<T extends Component>( name: string ): T {
		let result = <HTMLElement>this.dom.querySelector( `[name="${name}"]` );
		return result ? Component.getElement<T>(result) : null;
	}

	getValues( ) {
		return this.m_form.getValues( );
	}

	validate( ) {
		return this.m_form.validate( );
	}
}
