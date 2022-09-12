"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file autocomplete.ts
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
exports.AutoComplete = void 0;
const listview_1 = require("./listview");
const textedit_1 = require("./textedit");
/**
 *
 */
class AutoComplete extends textedit_1.TextEdit {
    m_popup;
    m_popvis;
    m_needval;
    m_lockpop;
    constructor(props) {
        super(props);
        this.setDomEvent("input", () => this._onChange());
        this.setDomEvent("focusin", () => this._onFocus());
        this.startTimer("focus-check", 100, true, () => this._checkFocus());
        this.m_popvis = false;
        this.m_needval = false;
        this.m_lockpop = false;
        this.setDomEvent("keydown", e => this._onKey(e));
    }
    _onKey(e) {
        if (this.m_popvis) {
            if (e.key == "ArrowUp" || e.key == "ArrowDown") {
                this.m_lockpop = true;
                this.m_popup.handleKey(e);
                this.m_lockpop = false;
                e.preventDefault();
                e.stopPropagation();
            }
            else if (e.key == "Escape") {
                this._hidePopup();
                e.preventDefault();
                e.stopPropagation();
            }
        }
        else if (e.key == "ArrowDown") {
            this._onChange();
            e.preventDefault();
            e.stopPropagation();
        }
    }
    _onChange() {
        const items = this.m_props.enumValues(this.value);
        this.showPopup(items);
    }
    componentDisposed() {
        if (this.m_popup) {
            this._hidePopup();
        }
        super.componentDisposed();
    }
    /**
     * display the popup
     */
    showPopup(items) {
        let props = this.m_props;
        if (props.readOnly || this.hasClass("@disable")) {
            return;
        }
        // need creation ?
        if (!this.m_popup) {
            let cstyle = this.getComputedStyle();
            let fontFamily = cstyle.value('fontFamily');
            let fontSize = cstyle.value('fontSize');
            // prepare the combo listview
            this.m_popup = new listview_1.PopupListView({
                cls: '@combo-popup',
                attrs: {
                    tabindex: 0
                },
                selectionChange: (e) => {
                    this.value = e.selection.id;
                    if (!this.m_lockpop) {
                        this._hidePopup();
                        this.focus();
                    }
                },
                style: {
                    fontFamily,
                    fontSize
                }
            });
        }
        this.m_popup.items = items.map(c => ({ id: c, text: c }));
        let r1 = this.m_ui_input.getBoundingRect();
        this.m_popup.setStyle({
            minWidth: r1.width,
        });
        this.m_popup.displayAt(r1.left, r1.bottom);
        this.m_popvis = true;
        //if( this.value!==undefined ) {
        //	this.m_popup.selection = this.value;
        //}
    }
    _validate(value) {
        return true;
    }
    validate() {
        return super._validate(this.value);
    }
    _checkFocus() {
        const focus = document.activeElement;
        if (this.dom && this.dom.contains(focus)) {
            return;
        }
        if (this.m_popup && this.m_popup.dom && this.m_popup.dom.contains(focus)) {
            return;
        }
        this._hidePopup();
    }
    _hidePopup() {
        if (this.m_popvis) {
            this.m_popup.close();
            this.m_popvis = false;
        }
        if (this.m_needval) {
            this.validate();
            this.m_needval = false;
        }
    }
    _onFocus() {
        if (this.value.length == 0) {
            this._onChange();
        }
        this.m_needval = true;
    }
}
exports.AutoComplete = AutoComplete;
