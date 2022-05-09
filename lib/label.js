"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file label.ts
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
exports.Label = void 0;
const component_1 = require("./component");
const tools_1 = require("./tools");
const icon_1 = require("./icon");
/**
 * Standard label
 */
class Label extends component_1.Component {
    constructor(param) {
        if (typeof (param) === 'string' || param instanceof tools_1.HtmlString) {
            super({ text: param });
        }
        else {
            super(param);
        }
    }
    /** @ignore */
    render(props) {
        let text = this.m_props.text;
        if (this.m_props.multiline && !(text instanceof tools_1.HtmlString)) {
            text = new tools_1.HtmlString(text.replace(/\n/g, '<br/>'));
        }
        if (!props.icon) {
            this.setContent(text);
        }
        else {
            this.setProp('tag', 'span');
            this.addClass('@hlayout');
            this.setContent([
                new icon_1.Icon({ icon: props.icon }),
                new component_1.Component({ content: text, ref: 'text' })
            ]);
        }
        this.addClass(props.align ?? 'left');
    }
    /**
     * change the displayed text
     * @param text - new text
     */
    set text(txt) {
        let props = this.m_props;
        if (props.text !== txt) {
            props.text = txt;
            let text = this.m_props.text;
            if (this.m_props.multiline && !(text instanceof tools_1.HtmlString)) {
                text = new tools_1.HtmlString(text.replace('/\n/g', '<br/>'));
            }
            if (this.dom) {
                let comp = this;
                if (this.m_props.icon) {
                    comp = this.itemWithRef('text');
                }
                comp.setContent(text);
            }
        }
    }
    /**
     *
     */
    get text() {
        return this.m_props.text;
    }
}
exports.Label = Label;
