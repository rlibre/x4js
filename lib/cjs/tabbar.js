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
exports.TabBar = void 0;
const component_1 = require("./component");
const button_1 = require("./button");
const x4events_1 = require("./x4events");
class TabBar extends component_1.Container {
    constructor(props) {
        var _a;
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
        (_a = this.m_props.pages) === null || _a === void 0 ? void 0 : _a.forEach(p => this.addPage(p));
    }
    componentCreated() {
        if (this.m_props.default) {
            this.select(this.m_props.default, true);
        }
    }
    addPage(page) {
        this.m_pages.push(Object.assign({}, page));
        this._updateContent();
    }
    render() {
        let buttons = [];
        this.m_pages.forEach(p => {
            p.btn = new button_1.Button({ cls: p === this.m_curPage ? 'selected' : '', text: p.title, icon: p.icon, click: () => this._select(p, true) });
            buttons.push(p.btn);
        });
        this.setContent(buttons);
    }
    select(id, notify = false) {
        if (!id) {
            this._select(null, notify);
            return true;
        }
        else {
            let page = this.m_pages.find(x => x.id === id);
            if (page) {
                this._select(page, notify);
                return true;
            }
            return false;
        }
    }
    _select(p, notify) {
        if (this.m_curPage == p) {
            return;
        }
        if (!this.dom) {
            this.m_props.default = p.id;
            return;
        }
        if (this.m_curPage) {
            this.m_curPage.btn.removeClass('selected');
            if (this.m_curPage.page) {
                this.m_curPage.page.hide();
            }
        }
        this.m_curPage = p;
        if (notify) {
            this.signal('change', (0, x4events_1.EvChange)(p ? p.id : null));
        }
        if (this.m_curPage) {
            this.m_curPage.btn.addClass('selected');
            if (this.m_curPage.page) {
                this.m_curPage.page.show();
            }
        }
    }
    get selection() {
        var _a;
        return (_a = this.m_curPage) === null || _a === void 0 ? void 0 : _a.page;
    }
}
exports.TabBar = TabBar;
