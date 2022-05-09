/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file popup.ts
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

import { Container, CProps, flyWrap, SizerOverlay, EvOverlayResize, Component, ContainerEventMap, EvSize } from './component'
import { Point, Size, getMousePos, asap } from './tools'
import { BasicEvent } from './x4_events';
import { Application } from './application';


export interface EvMove extends BasicEvent {
	pos: Point;
}

export function EvMove(pos: Point): EvMove {
	return BasicEvent<EvMove>({ pos });
}


export interface PopupEventMap extends ContainerEventMap {
	size: EvSize;
	move: EvMove;
}

export interface PopupProps<E extends PopupEventMap = PopupEventMap> extends CProps<E> {
	sizable?: boolean;
}


/**
 * base class for all popup elements
 */

export class Popup<P extends PopupProps = PopupProps, E extends PopupEventMap = PopupEventMap> extends Container<P, E>
{
	protected m_ui_mask: HTMLElement;
	private m_hasMask: boolean = true;

	static modal_stack: HTMLElement[] = [];

	constructor(props: P) {
		super(props);

		this.addClass('@hidden');
	}

	enableMask(enable = true) {
		this.m_hasMask = enable;
	}

	/**
	 * display the popup on screen
	 */

	public show(modal?: boolean) {

		if (modal !== undefined) {
			this.m_hasMask = modal ? true : false;
		}
		else {
			modal = this.m_hasMask;
		}

		if (this.m_hasMask) {

			// remove the focus
			const focus = document.activeElement as HTMLElement;
			if (focus) {
				focus.blur()
			}
			this.m_ui_mask = <HTMLElement>document.body.lastChild;

			while (this.m_ui_mask) {

				if (this.m_ui_mask.nodeType == 1) { 	// only element nodes

					let elUI = flyWrap(this.m_ui_mask);

					if (elUI.hasClass('@menu') || elUI.hasClass('@non-maskable') ) {
						/* avoid circular dependencies instanceof Menu*/
						/* avoid nonmaskable elements tobe masked */
					}
					else if (elUI.getStyleValue('display') == 'none' || !elUI.isUserVisible()) {
						/* avoid masking hidden elements */
					}
					else if( !elUI.hasClass('@comp') ) {
						/* avoid masking element that are not to us */
					}
					else {
						break;
					}
				}

				this.m_ui_mask = <HTMLElement>this.m_ui_mask.previousSibling;
			}

			if (this.m_ui_mask) {
				flyWrap(this.m_ui_mask).addClass('@mask');
			}
		}

		if (modal) {
			Application.instance().enterModal(true);
		}

		// to avoid body growing because of appendChild
		this.setStyle({
			left: 0,
			top: 0
		});

		document.body.appendChild(this._build());

		this.removeClass('@hidden');
		this.centerOnScreen( );

		if (modal) {
			let focus = document.activeElement;
			if (!this.dom.contains(focus)) {
				
				const autofocus = this.queryItem('[autofocus]');
				if( autofocus ) {
					autofocus.focus( )
				}
				else {
					let tabbable = this.queryItem('[tabindex]');

					if( tabbable ) {
						let tab_indexes: HTMLElement[] = [].map.call(tabbable, (e) => { return e; });

						// remove hidden elements
						tab_indexes = tab_indexes.filter((el) => el.offsetParent !== null);
						if (tab_indexes.length) {
							tab_indexes[0].focus( );
						}
					}
				}
			}

			Popup.modal_stack.push(this.dom);
		}
	}

	centerOnScreen( ) {
		let rc = this.getBoundingRect();

		let x = (document.body.clientWidth - rc.width) / 2,
			y = (document.body.clientHeight - rc.height) / 2;

		this.setStyleValue('left', x);
		this.setStyleValue('top', y);
	}

	/**
	* display the popup at a specific position
	* @param x 
	* @param y 
	*/

	public displayAt(x: number, y: number, align: string = 'top left', offset?: { x, y }) {

		this.show();

		let halign = 'l',
			valign = 't';

		if (align.indexOf('right') >= 0) {
			halign = 'r';
		}

		if (align.indexOf('bottom') >= 0) {
			valign = 'b';
		}

		// @TODO: this is a minimal overflow problem solution
		let rc = document.body.getBoundingClientRect(),
			rm = this.getBoundingRect();

		if (halign == 'r') {
			x -= rm.width;
		}

		if (valign == 'b') {
			y -= rm.height;
		}

		if (offset) {
			x += offset.x;
			y += offset.y;
		}

		if (x < 4) {
			x = 4;
		}

		if ((x + rm.width) > rc.right - 4) {
			x = rc.right - 4 - rm.width;
			if (offset?.x < 0) {
				x += offset.x;
			}
		}

		if (y < 4) {
			y = 4;
		}

		if ((y + rm.height) > rc.bottom - 4) {
			y = rc.bottom - 4 - rm.height;

			if (offset?.y < 0) {
				y += offset.y;
			}
		}

		this.setStyle({ left: x, top: y });
	}

	/**
	 * close the popup 
	 */

	public close() {
		this.hide();

		if (this.m_hasMask && this.m_ui_mask) {
			flyWrap(this.m_ui_mask).removeClass('@mask');
			const app = Application.instance();
			app.enterModal(false);
		}

		let index = Popup.modal_stack.indexOf(this.dom);
		if (index >= 0) {
			Popup.modal_stack.splice(index);
		}

		this.dispose();
	}

	componentCreated() {

		if (this.m_props.sizable) {

			this.addClass('@size-all');

			let els = ['top', 'right', 'bottom', 'left', 'topleft', 'topright', 'bottomleft', 'bottomright'];

			for (let sens of els) {
				new SizerOverlay({
					target: this,
					sens: sens as any,
					events: { rawresize: (e) => this._mouseResize(e) }
				});
			}
		}
	}

	/**
	 * resize for 'all' resize attribute
	 */

	private _mouseResize(event: EvOverlayResize) {

		event.preventDefault();

		let irc = this.getBoundingRect();
		let st = this.getComputedStyle();
		let ev = event.ui_event;

		let tm = st.parse('marginTop'),
			lm = st.parse('marginLeft'),
			rm = st.parse('marginRight'),
			bm = st.parse('marginBottom');

		let ix = 0,
			iy = 0;

		let mp = getMousePos(ev, true);

		// horz
		switch (event.sens) {
			case 'topright':
			case 'bottomright':
			case 'right': ix = (irc.right - rm) - mp.x; break;

			case 'topleft':
			case 'bottomleft':
			case 'left': ix = (irc.left - lm) - mp.x; break;
		}

		// vert
		switch (event.sens) {
			case 'bottomleft':
			case 'bottomright':
			case 'bottom': iy = (irc.bottom - bm) - mp.y; break;

			case 'topleft':
			case 'topright':
			case 'top': iy = (irc.top - tm) - mp.y; break;
		}

		// left & top are with margin
		// width & height not
		irc.left -= lm;
		irc.top -= tm;

		//console.log( 'capture' );

		let sens = event.sens;

		Component.setCapture(this, (ne: UIEvent) => {

			//console.log( ne );

			let __move = (ex, ey) => {

				let left = irc.left,
					top = irc.top,
					width = irc.width,
					height = irc.height;

				let dx, dy;
				let px = ex + ix,
					py = ey + iy;

				if (px < 0) {
					px = 0;
				}

				if (py < 0) {
					py = 0;
				}

				// horz
				switch (sens) {
					case 'topright':
					case 'bottomright':
					case 'right': width = px - left; break;

					case 'topleft':
					case 'bottomleft':
					case 'left': dx = left - px; width += dx; left -= dx; break;
				}

				// vert
				switch (sens) {
					case 'bottomleft':
					case 'bottomright':
					case 'bottom': height = py - top; break;

					case 'topleft':
					case 'topright':
					case 'top': dy = top - py; height += dy; top -= dy; break;
				}

				let newsize = new Size(width, height);
				this.setStyle({ left, top, width: newsize.width, height: newsize.height });

				this.emit('size', EvSize(newsize));
			}

			if (ne.type == 'mouseup' || ne.type == 'touchend') {
				Component.releaseCapture();
			}
			else if (ne.type == 'mousemove') {
				let me = ne as MouseEvent;
				__move(me.pageX, me.pageY);
			}
			else if (ne.type == 'touchmove') {
				let tev = ne as TouchEvent;
				__move(tev.touches[0].pageX, tev.touches[0].pageY);
			}
		});
	}
}





/**
 * handle tab key
 */

function x4handleKeyDown(e: KeyboardEvent) {

	if (e.key == 'Tab' || e.key == 'Enter') {

		const target = e.target as HTMLElement;
		if (target.tagName == 'TEXTAREA') {
			return;
		}

		const el = Component.getElement( target );
		if( el && (el.hasAttribute('wants-tab') || el.hasAttribute('wants-enter')) ) {
			return;
		}

		let topStack = document.body;
		if (Popup.modal_stack.length) {
			topStack = Popup.modal_stack[Popup.modal_stack.length - 1];
		}

		_nextTab(topStack, e.target as HTMLElement, e.shiftKey);
		e.stopPropagation();
		e.preventDefault();
	}
}

/**
 * cycle through tabs
 */

function _nextTab(root: HTMLElement, el: HTMLElement, prev: boolean) {

	// first check if the focus is one of our child (disabled...)
	let focusEl = document.activeElement;
	if (!root.contains(focusEl)) {
		return;
	}

	let comp = Component.getElement(el);

	// get a list of elements with tab index, this way we should abble to
	// cycle on them (not on browser address nor under dialog elements)
	let tabbable = root.querySelectorAll('[tabindex]');
	let tab_indexes: HTMLElement[] = [].map.call(tabbable, (e) => { return e; });

	// remove hidden elements
	tab_indexes = tab_indexes.filter((el) => el.offsetParent !== null);
	if (!tab_indexes.length) {
		return;
	}

	let ct = tab_indexes.indexOf(el);

	if (ct < 0) {
		ct = 0;
	}
	else {
		if (prev) {
			if (ct > 0) {
				ct--;
			}
			else {
				ct = tab_indexes.length - 1;
			}
		}
		else {
			if (ct < tab_indexes.length - 1) {
				ct++;
			}
			else {
				ct = 0;
			}
		}
	}

	tab_indexes[ct].focus();
}

function installKBHandler( ) {
	// set on body to be called after document (where all component domevent go)
	document.body.addEventListener('keydown', x4handleKeyDown, true);
}

// too early ?
document.body ? installKBHandler( ) : window.addEventListener( 'load', installKBHandler );
