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
