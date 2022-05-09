"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file cardview.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardView = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const tools_1 = require("./tools");
/**
 * Standard CardView class
 * a card view is composed of multiples pages with only one visible at a time.
 * pages can be selected by a component (like tabs ou sidebar).
 * or by code.
 */
class CardView extends component_1.Component {
    m_cards;
    m_ipage; // initialy selected page
    m_cpage; // currently selected page
    constructor(props) {
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
    switchTo(name) {
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
                let page = this.m_cpage.page;
                page.removeClass('@active');
                page.addClass('@hidden');
            }
        }
        this.m_cpage = this.m_cards.find((card) => card.name == name);
        if (this.m_cpage) {
            if (this.m_cpage.page) {
                if ((0, tools_1.isFunction)(this.m_cpage.page)) {
                    this.m_cpage.page = this.m_cpage.page();
                    console.assert(this.m_cpage.page != null, 'You must return a valid component');
                }
                let page = this.m_cpage.page;
                page.addClass('@active');
                page.removeClass('@hidden');
                if (!page.dom) {
                    this._preparePage(page);
                }
            }
            this.emit('change', (0, x4_events_1.EvChange)(this.m_cpage.name));
        }
    }
    /**
     *
     */
    setPages(pages) {
        let active = this._initTabs(pages);
        if (active) {
            (0, tools_1.asap)(() => {
                this.switchTo(active);
                this.update();
            });
        }
    }
    /**
     *
     */
    _initTabs(pages) {
        if (!pages) {
            return;
        }
        let active = this.m_ipage;
        pages.forEach((p) => {
            if (!p) {
                return;
            }
            let card = { ...p };
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
    _updateSelector() {
    }
    /**
     * prepare the cardinfo
     * can be used by derivations to create & set selectors
     */
    _prepareSelector(card) {
        return null;
    }
    /**
     *
     */
    _preparePage(page) {
        page.setStyleValue('flex', 1);
        page.addClass('@tab-page');
    }
}
exports.CardView = CardView;
