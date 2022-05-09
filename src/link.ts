/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file link.ts
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

import { Component, CProps, CEventMap, isHtmlString, HtmlString, html } from './component'
import { EvClick, EventCallback } from './x4_events'

// ============================================================================
// [LINK]
// ============================================================================

interface LinkEventMap extends CEventMap {
	click: EvClick;
}

export interface LinkProps extends CProps<LinkEventMap> {
	text?: string | HtmlString;
	href?: string;
	target?: string;
	click?: EventCallback<EvClick>;	// shortcut to event { click: ... }
}


/**
 * Standard Link
 */

export class Link extends Component<LinkProps, LinkEventMap>
{
	constructor(props?: LinkProps) {
		super(props);

		this.setDomEvent('click', () => this._handleClick());
		this.mapPropEvents(props, 'click');
	}

	private _handleClick() {
		this.emit('click', EvClick());
	}

	/** @ignore */
	render(props: LinkProps) {

		let text = props.text ?? '';
		let href = props.href ?? '#';

		this.setAttribute('tabindex', 0);
		this.setProp('tag', 'a');
		this.setAttribute('href', href);
		this.setAttribute('target', props.target);

		if( text ) {
			this.setContent(isHtmlString(text) ? text : html`<span>${text}</span>`);
		}
	}

	set text( text: string | HtmlString ) {
		this.m_props.text = text;
		this.update( );
	}
}