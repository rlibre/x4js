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
