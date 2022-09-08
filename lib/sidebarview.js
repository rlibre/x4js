"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file sidebarview.ts
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
exports.SideBarView = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const button_1 = require("./button");
const cardview_1 = require("./cardview");
/**
 *
 */
class SideBarView extends cardview_1.CardView {
    m_sidebar;
    m_content;
    constructor(props) {
        super(props);
        this.addClass('@hlayout');
        this.m_sidebar = new layout_1.VLayout({
            cls: '@side-bar',
            width: props.bar_width ?? undefined,
        });
        this.m_content = new layout_1.HLayout({ flex: 1, cls: '@tab-container' });
    }
    /** @ignore */
    render() {
        let tabs = [];
        this.m_cards.forEach((p) => {
            tabs.push(p.selector);
        });
        this.m_sidebar.setContent(new layout_1.VLayout({
            flex: 1,
            cls: 'content',
            content: tabs
        }));
        this.setContent([
            this.m_sidebar,
            this.m_props.bar_sizable ? new component_1.Separator({ orientation: "horizontal", sizing: "before" }) : undefined,
            this.m_content
        ]);
    }
    _prepareSelector(card) {
        return new button_1.Button({
            text: card.title,
            icon: card.icon,
            tooltip: card.title,
            click: () => { this.switchTo(card.name); }
        });
    }
    _preparePage(page) {
        super._preparePage(page);
        if (!page.dom) {
            this.m_content.appendChild(page);
        }
    }
}
exports.SideBarView = SideBarView;
