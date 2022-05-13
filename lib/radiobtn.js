"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file radiobtn.ts
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
exports.RadioBtn = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const input_1 = require("./input");
const label_1 = require("./label");
/**
 * Standard RadioBtn
 */
class RadioBtn extends component_1.Component {
    m_ui_input; // todo: remove that / use ref
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
    }
    /** @ignore */
    render(props) {
        let text = props.text ?? '';
        let name = props.name ?? props.group;
        let labelWidth = props.labelWidth ?? -1;
        let checked = props.checked ?? false;
        let align = props.align ?? 'left';
        let value = props.value;
        let icon = props.icon;
        this.addClass('@hlayout');
        this.setProp('tag', 'label');
        this.addClass(align);
        this._setTabIndex(props.tabIndex);
        if (checked) {
            this.addClass('checked');
        }
        this.setContent([
            this.m_ui_input = new input_1.Input({
                type: 'radio',
                name: name,
                tabIndex: props.tabIndex,
                value: value,
                attrs: {
                    checked: checked ? '' : undefined
                },
                dom_events: {
                    change: () => this._change(),
                    focus: () => this.m_ui_input.focus(),
                }
            }),
            new label_1.Label({
                ref: 'label',
                icon: icon,
                text: text,
                width: labelWidth === 'flex' ? undefined : labelWidth,
                flex: labelWidth === 'flex' ? 1 : undefined,
                style: {
                    order: align == 'right' ? -1 : undefined,
                },
            })
        ]);
    }
    /**
     * check state changed
     */
    _change() {
        let props = this.m_props;
        let query = '.x-input[name=' + props.name + ']';
        let nlist = document.querySelectorAll(query); //todo: document ?
        nlist.forEach((dom) => {
            let radio = component_1.Component.getElement(dom, RadioBtn);
            radio.removeClass('checked');
        });
        let dom = this.m_ui_input.dom;
        this.setClass('checked', dom.checked);
        this.emit('change', (0, x4_events_1.EvChange)(true));
    }
    /**
     * @return the checked value
     */
    get check() {
        if (this.m_ui_input) {
            return this.m_ui_input.dom.checked;
        }
        return this.m_props.checked;
    }
    /**
     * change the checked value
     * @param {boolean} ck new checked value
     */
    set check(ck) {
        let dom = this.m_ui_input.dom;
        if (ck) {
            //this.addClass( 'checked' );
            if (dom) {
                dom.checked = true;
            }
            this.m_props.checked = true;
        }
        else {
            //this.removeClass( 'checked' );
            if (dom) {
                dom.checked = false;
            }
            this.m_props.checked = false;
        }
    }
    get text() {
        return this.itemWithRef('label').text;
    }
    set text(text) {
        this.itemWithRef('label').text = text;
    }
}
exports.RadioBtn = RadioBtn;
