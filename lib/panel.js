"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file panel.ts
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
exports.Panel = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const label_1 = require("./label");
const icon_1 = require("./icon");
class Panel extends layout_1.VLayout {
    m_ui_title;
    m_ui_body;
    constructor(props) {
        super(props);
        const sens = props?.sens == 'horizontal' ? '@hlayout' : '@vlayout';
        //todo: cannot be called twice do to content overload
        this.m_ui_title = new label_1.Label({ cls: 'title', text: this.m_props.title });
        this.m_ui_body = new component_1.Component({ cls: 'body ' + sens, content: this.m_props.content });
    }
    /** @ignore */
    render() {
        const gadgets = this.m_props.gadgets ?? [];
        const icon = this.m_props.icon ? new icon_1.Icon({ icon: this.m_props.icon }) : null;
        super.setContent([
            new layout_1.HLayout({
                cls: 'title',
                content: [
                    icon,
                    this.m_ui_title,
                    ...gadgets
                ]
            }),
            this.m_ui_body
        ]);
    }
    setContent(els) {
        this.m_ui_body.setContent(els);
    }
    set title(text) {
        this.m_ui_title.text = text;
    }
}
exports.Panel = Panel;
