"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file link.ts
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
exports.Link = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
/**
 * Standard Link
 */
class Link extends component_1.Component {
    constructor(props) {
        super(props);
        this.setDomEvent('click', () => this._handleClick());
        this.mapPropEvents(props, 'click');
    }
    _handleClick() {
        this.emit('click', (0, x4_events_1.EvClick)());
    }
    /** @ignore */
    render(props) {
        let text = props.text ?? '';
        let href = props.href ?? '#';
        this.setAttribute('tabindex', 0);
        this.setProp('tag', 'a');
        this.setAttribute('href', href);
        this.setAttribute('target', props.target);
        if (text) {
            this.setContent((0, component_1.isHtmlString)(text) ? text : (0, component_1.html) `<span>${text}</span>`);
        }
    }
    set text(text) {
        this.m_props.text = text;
        this.update();
    }
}
exports.Link = Link;
