"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file combobox.ts
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
exports.ComboBox = void 0;
/**
 * TODO: replace custom combo list by listview or gridview
 */
const component_1 = require("./component");
const x4events_1 = require("./x4events");
const input_1 = require("./input");
const label_1 = require("./label");
const button_1 = require("./button");
const layout_1 = require("./layout");
const listview_1 = require("./listview");
const datastore_1 = require("./datastore");
const tools_1 = require("./tools");
/**
 * @review use textedit
 */
class ComboBox extends layout_1.HLayout {
    m_ui_input;
    m_ui_button;
    m_popup;
    m_selection;
    m_defer_sel;
    constructor(props) {
        super(props);
        this.setDomEvent('keypress', () => this.showPopup());
        this.setDomEvent('click', () => this.showPopup());
        this.mapPropEvents(props, 'selectionChange');
    }
    set items(items) {
        this.m_props.items = items;
        if (this.m_popup) {
            this.m_popup.items = items;
        }
    }
    /** @ignore */
    render(props) {
        if (!props.renderer) {
            this.m_ui_input = new input_1.Input({
                flex: 1,
                readOnly: true,
                tabIndex: 0,
                name: props.name,
                value_hook: {
                    get: () => { return this.value; },
                    set: (v) => { this.value = v; }
                }
            });
        }
        else {
            this.m_ui_input = new component_1.Component({
                flex: 1,
                cls: '@fake-input @hlayout',
                tabIndex: 1
            });
        }
        let width = undefined, flex = undefined;
        let labelWidth = props.labelWidth ?? 0;
        if (labelWidth > 0) {
            width = labelWidth;
        }
        else if (labelWidth < 0) {
            flex = -labelWidth;
        }
        this.setContent([
            // todo: why 'label1' class name
            new label_1.Label({
                cls: 'label1' + (props.label ? '' : ' @hidden'),
                text: props.label,
                width,
                flex,
                align: props.labelAlign
            }),
            new layout_1.HLayout({
                flex: 1,
                content: [
                    this.m_ui_input,
                    this.m_ui_button = new button_1.Button({
                        cls: 'gadget',
                        icon: 'var( --x4-icon-angle-down )',
                        tabIndex: false,
                        click: () => this.showPopup(),
                        dom_events: {
                            focus: () => { this.dom.focus(); },
                        }
                    })
                ]
            }),
        ]);
        if (props.value !== undefined) {
            this.value = props.value;
        }
    }
    componentDisposed() {
        if (this.m_popup) {
            this.m_popup.close();
        }
        super.componentDisposed();
    }
    /**
     * display the popup
     */
    showPopup() {
        let props = this.m_props;
        if (props.readOnly) {
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
                items: props.items,
                populate: props.populate,
                renderItem: this.m_props.renderer,
                selectionChange: (e) => this._selectItem(e),
                cancel: (e) => this.signal('cancel', e),
                style: {
                    fontFamily,
                    fontSize
                }
            });
        }
        let r1 = this.m_ui_button.getBoundingRect(), r2 = this.m_ui_input.getBoundingRect();
        this.m_popup.setStyle({
            minWidth: r1.right - r2.left,
        });
        this.m_popup.displayAt(r2.left, r2.bottom);
        if (this.value !== undefined) {
            this.m_popup.selection = this.value;
        }
    }
    /** @ignore
      */
    _selectItem(ev) {
        let item = ev.selection;
        if (!item) {
            return;
        }
        this._setInput(item, true);
        this.m_selection = {
            id: item.id,
            text: item.text
        };
        this.emit('selectionChange', (0, x4events_1.EvSelectionChange)(item));
        this.emit('change', (0, x4events_1.EvChange)(item.id));
        this.m_ui_input.focus();
        this.m_popup.hide();
    }
    /**
     *
     */
    _setInput(item, fireEv = false) {
        if (item) {
            if (this.m_ui_input) {
                if (this.m_ui_input instanceof input_1.Input) {
                    this.m_ui_input.value = item.text;
                    // fires a change event
                    if (fireEv) {
                        this.m_ui_input.dom.dispatchEvent(new Event('input'));
                    }
                }
                else {
                    this.m_ui_input.setContent(this.m_props.renderer(item));
                }
            }
            else {
                this.m_props.value = item.id;
            }
        }
    }
    /**
     *
     */
    get value() {
        return this.m_selection ? this.m_selection.id : undefined;
    }
    get valueText() {
        return this.m_selection ? this.m_selection.text : undefined;
    }
    /**
     *
     */
    set value(id) {
        let items = this.m_props.items;
        if ((0, tools_1.isFunction)(items)) {
            items = items();
        }
        items.some((v) => {
            if (v.id === id) {
                this._setInput(v);
                this.m_selection = v;
                return true;
            }
        });
    }
    get input() {
        return this.m_ui_input instanceof input_1.Input ? this.m_ui_input : null;
    }
    static storeProxy(props) {
        let view = props.store instanceof datastore_1.DataStore ? props.store.createView() : props.store;
        return () => {
            let result = new Array(props.store.count);
            props.store.forEach((rec, index) => {
                result[index] = {
                    id: rec.getID(),
                    text: props.display(rec)
                };
            });
            return result;
        };
    }
}
exports.ComboBox = ComboBox;
/*
 export type CBComboBoxRenderer = ( rec: Record ) => string;
export interface ComboBoxStore {
    store: DataStore;
    display: string | CBComboBoxRenderer;		// if string, the field name to display
}

*/
