/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file tooltips.ts
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

import { Component } from './component'
import { Label } from './label'
import { Icon } from './icon'
import { isTouchDevice } from './tools'


let tipTmo;
let tooltip;

/**
 * 
 */

export class Tooltip extends Component {

	private m_text: Label;

	set text(text) {
		this.m_text.text = text;
	}

	/** @ignore */
	render() {
		this.setClass('@non-maskable', true);
		this.setContent([
			new Icon({ icon: 'var( --x4-icon-tip' }),
			this.m_text = new Label({ text: 'help' })
		]);
	}

	/**
	* display the menu at a specific position
	* @param x 
	* @param y 
	*/

	public displayAt(x: number, y: number, align: string = 'top left') {

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

		if ((x + rm.width) > rc.right) {
			x = rc.right - rm.width;
		}

		if ((y + rm.height) > rc.bottom) {
			y = rc.bottom - rm.height - 17;	// default cursor height
		}

		this.setStyle({ left: x, top: y });
	}
}

export type TooltipHandler = (text: string) => void;

export function initTooltips(cb?: TooltipHandler) {

	if (isTouchDevice()) {
		return;
	}

	let tipTarget = {
		target: null,
		x: 0,
		y: 0
	};

	function handle_mpos(event: MouseEvent) {
		tipTarget.x = event.pageX;
		tipTarget.y = event.pageY;
	}

	function handle_mouse(event: MouseEvent) {

		let target: HTMLElement = <HTMLElement>event.target;
		let tip = null;

		tipTarget.x = event.pageX + 10;
		tipTarget.y = event.pageY + 15;

		while (target) {
			tip = target.getAttribute('tip');
			if (tip) {
				break;
			}

			target = target.parentElement;
		}

		if (target == tipTarget.target || (tooltip && target == tooltip.dom)) {
			return;
		}

		if (!target || !tip) {
			tipTarget.target = null;

			if (cb) { cb(null); }
			else { _hideTip(); }

			return;
		}

		tipTarget.target = target;
		if (cb) { cb(null); }
		else { _hideTip(); }

		if (cb) {
			cb(tip);
		}
		else {
			tipTmo = setTimeout(() => {

				if (tooltip === undefined) {
					tooltip = new Tooltip({});
					document.body.appendChild(tooltip._build());
				}

				tooltip.text = tip;
				tooltip.displayAt(tipTarget.x + 17, tipTarget.y + 17, 'top left');
			}, 700);
		}

	}

	function _hideTip() {
		if (tipTmo) {
			clearTimeout(tipTmo);
		}

		if (tooltip) {
			tooltip.hide();
		}
	}

	document.body.addEventListener('mouseover', handle_mouse);
	document.body.addEventListener('mouseout', handle_mouse);
	document.body.addEventListener('mousemove', handle_mpos);
}