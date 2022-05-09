"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tabbar.ts
* @author Etienne Cochard
* @copyright (c) 2021 R-libre ingenierie, all rights reserved.
*
* @description Tab
**/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBar = void 0;
const component_1 = require("./component");
const button_1 = require("./button");
const x4_events_1 = require("./x4_events");
class TabBar extends component_1.Container {
    m_pages;
    m_curPage;
    constructor(props) {
        super(props);
        this.m_pages = [];
        this.m_curPage = null;
        this.mapPropEvents(props, 'change');
        if (props.vertical) {
            this.addClass('@vlayout');
        }
        else {
            this.addClass('@hlayout');
        }
        this.m_props.pages?.forEach(p => this.addPage(p));
        if (this.m_props.default) {
            this.select(this.m_props.default);
        }
    }
    addPage(page) {
        this.m_pages.push({ ...page });
        this._updateContent();
    }
    render() {
        let buttons = [];
        this.m_pages.forEach(p => {
            p.btn = new button_1.Button({ cls: p === this.m_curPage ? 'selected' : '', text: p.title, icon: p.icon, click: () => this._select(p) });
            buttons.push(p.btn);
        });
        this.setContent(buttons);
    }
    select(id) {
        let page = this.m_pages.find(x => x.id === id);
        if (page) {
            this._select(page);
        }
    }
    _select(p) {
        if (this.dom && this.m_curPage && this.m_curPage.page) {
            this.m_curPage.btn.removeClass('selected');
            this.m_curPage.page.hide();
        }
        this.m_curPage = p;
        this.signal('change', (0, x4_events_1.EvChange)(p ? p.id : null));
        if (this.dom && this.m_curPage && this.m_curPage.page) {
            this.m_curPage.btn.addClass('selected');
            this.m_curPage.page.show();
        }
    }
}
exports.TabBar = TabBar;
