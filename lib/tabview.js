"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tabview.ts
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
exports.TabView = void 0;
const layout_1 = require("./layout");
const button_1 = require("./button");
const cardview_1 = require("./cardview");
/**
 * Standard TabView class
 */
class TabView extends cardview_1.CardView {
    m_tab_selector;
    m_menu;
    constructor(props) {
        super(props);
        this.m_tab_selector = props.tab_selector ? true : false;
        this.m_menu = props.menu;
        this.addClass('@vlayout');
    }
    /** @ignore */
    render() {
        let tabs = [];
        let pages = [];
        if (this.m_menu) {
            this.m_menu.addClass('@button @tab-btn');
            this.m_menu.removeClass('@menu-item');
            tabs.push(this.m_menu);
        }
        this.m_cards.forEach((p) => {
            tabs.push(p.selector);
            if (!(p.page instanceof Function)) {
                pages.push(p.page);
            }
        });
        if (this.m_tab_selector) {
            pages.unshift(new layout_1.HLayout({
                cls: '@tab-switch',
                content: tabs
            }));
        }
        this.setContent(pages);
    }
    _updateSelector() {
    }
    _prepareSelector(card) {
        return new button_1.Button({
            cls: '@tab-btn',
            text: card.title,
            icon: card.icon,
            click: () => { this.switchTo(card.name); }
        });
    }
    _preparePage(page) {
        super._preparePage(page);
        if (!page.dom) {
            this.appendChild(page);
        }
    }
}
exports.TabView = TabView;
