/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file cardview.ts
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
import { EvChange } from './x4events'

import { IconID } from './icon'
import { asap, isFunction } from './tools'

export type PageOrCallback = Component | (() => Component);

export interface ICardViewItem {
	icon?: IconID;
	name: string,
	title: string;
	page: PageOrCallback; // pre builded page
}


interface CardViewEventMap extends CEventMap {
	change?: EvChange;	// value is page name
}

export interface CardViewProps extends CProps<CardViewEventMap> {
	pages: ICardViewItem[];
	active?: string;
}

interface ICardItemEx extends ICardViewItem {
	selector: Component;
	active: boolean;
}

/**
 * Standard CardView class
 * a card view is composed of multiples pages with only one visible at a time.
 * pages can be selected by a component (like tabs ou sidebar).
 * or by code.
 */

export class CardView<P extends CardViewProps = CardViewProps, E extends CardViewEventMap = CardViewEventMap> extends Component<P, E>
{
	protected m_cards: ICardItemEx[];
	protected m_ipage: string;	// initialy selected page
	protected m_cpage: ICardItemEx;	// currently selected page

	constructor(props: P) {
		super(props);

		this.m_cards = [];
		this.m_ipage = props.active;
		this.m_cpage = null;

		this.singleShot(() => {
			this.setPages(props.pages);
		});
	}

	/** @ignore */
	render() {

		let pages = [];
		this.m_cards.forEach((p) => {
			if (p.page) {
				pages.push(p.page);
			}
		});

		this.setContent(pages);
	}

	/**
	 * switch to a specific card
	 * @param name - card name as define in constructor
	 */

	public switchTo(name?: string) {

		if (this.m_cards.length == 0) {
			return;
		}

		if (name === undefined) {
			name = this.m_cards[0].name;
		}

		if (name === this.m_cpage?.name) {
			return;
		}

		// hide old one
		if (this.m_cpage) {
			if (this.m_cpage.selector) {
				this.m_cpage.selector.removeClass('@active');
			}

			if (this.m_cpage.page && !(this.m_cpage.page instanceof Function)) {
				let page = <Component>this.m_cpage.page;
				page.removeClass('@active');
				page.addClass('@hidden');
			}
		}

		this.m_cpage = this.m_cards.find((card) => card.name == name);

		if (this.m_cpage) {
			if (this.m_cpage.page) {
				if (isFunction(this.m_cpage.page)) {
					this.m_cpage.page = this.m_cpage.page();
					console.assert(this.m_cpage.page != null, 'You must return a valid component');
				}

				let page = this.m_cpage.page as Component;

				page.addClass('@active');
				page.removeClass('@hidden');

				if (!page.dom) {
					this._preparePage(page);
				}
			}

			this.emit('change', EvChange(this.m_cpage.name));
		}
	}

	/**
	 * 
	 */

	setPages(pages: ICardViewItem[]) {
		let active = this._initTabs(pages);
		if (active) {
			asap(() => {
				this.switchTo(active)
				this.update();
			});
		}
	}

	/**
	 * 
	 */

	private _initTabs(pages): any {

		if (!pages) {
			return;
		}

		let active = this.m_ipage;

		pages.forEach((p) => {

			if( !p ) {
				return;
			}

			let card: ICardItemEx = { ...p };

			card.selector = this._prepareSelector(p);
			card.active = false;

			this.m_cards.push(card);

			if (!active) {
				active = p.name;
			}

			if (p.active) {
				active = p.name;
			}
		});

		return active;
	}

	protected _updateSelector() {
	}

	/**
	 * prepare the cardinfo
	 * can be used by derivations to create & set selectors
	 */

	protected _prepareSelector(card: ICardViewItem): Component {
		return null;
	}

	/**
	 * 
	 */

	protected _preparePage(page: Component) {
		page.setStyleValue('flex', 1);
		page.addClass('@tab-page');
	}
}