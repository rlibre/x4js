"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file button.ts
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
exports.ToggleButton = exports.Button = exports.BaseButton = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const icon_1 = require("./icon");
const label_1 = require("./label");
const menu_1 = require("./menu");
const tools_1 = require("./tools");
/**
 * Base button
 */
class BaseButton extends component_1.Component {
    constructor(props) {
        super(props);
        this.setProp('tag', 'button');
        this.setDomEvent('click', (e) => this._handleClick(e));
        this.setDomEvent('mousedown', () => { this._startAutoRep(true); });
        this.setDomEvent('mouseup', () => { this._startAutoRep(false); });
        this.setDomEvent('keydown', (e) => this._handleKeyDown(e));
        this.mapPropEvents(props, 'click');
    }
    render(props) {
        let icon = props.icon ? new icon_1.Icon({ icon: props.icon, cls: 'left', ref: 'l_icon' }) : null;
        let label = new label_1.Label({ flex: 1, text: props.text ?? '', align: props.align, ref: 'label' });
        let ricon = props.rightIcon ? new icon_1.Icon({ icon: props.rightIcon, cls: 'right', ref: 'r_icon' }) : null;
        this.setContent([icon, label, ricon]);
        this._setTabIndex(props.tabIndex);
    }
    /**
     * starts/stops the autorepeat
     */
    _startAutoRep(start) {
        if (!this.m_props.autoRepeat) {
            return;
        }
        if (start) {
            // 1st timer 1s
            this.startTimer('repeat', 700, false, () => {
                // auto click
                this.startTimer('repeat', this.m_props.autoRepeat, true, this._sendClick);
            });
        }
        else {
            this.stopTimer('repeat');
        }
    }
    /**
     *
     */
    _handleKeyDown(ev) {
        if (!ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
            if (ev.key == 'Enter' || ev.key == ' ') {
                this._sendClick();
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
    }
    /**
     * called by the system on click event
     */
    _handleClick(ev) {
        if (this.m_props.menu) {
            let menu = new menu_1.Menu({
                items: (0, tools_1.isFunction)(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
            });
            let rc = this.getBoundingRect();
            menu.displayAt(rc.left, rc.bottom, 'tl');
        }
        else {
            this._sendClick();
        }
        ev.preventDefault();
        ev.stopPropagation();
    }
    /**
     * sends a click to the observers
     */
    _sendClick() {
        if (this.m_props.menu) {
            let menu = new menu_1.Menu({
                items: (0, tools_1.isFunction)(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
            });
            let rc = this.getBoundingRect();
            menu.displayAt(rc.left, rc.bottom, 'tl');
        }
        else {
            this.emit('click', (0, x4_events_1.EvClick)());
        }
    }
    /**
     * change the button text
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello'
     * });
     *
     * btn.text = 'world';
     * ```
     */
    set text(text) {
        this.m_props.text = text;
        let label = this.itemWithRef('label');
        if (label) {
            label.text = text;
        }
    }
    get text() {
        let label = this.itemWithRef('label');
        return label?.text;
    }
    /**
     * change the button icon
     * todo: do nothing if no icon defined at startup
     *
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello',
     *  icon: 'close'
     * });
     * btn.setIcon( 'open' );
     * ```
     */
    set icon(icon) {
        this.m_props.icon = icon;
        let ico = this.itemWithRef('l_icon');
        if (ico) {
            ico.icon = icon;
        }
        else {
            this.update();
        }
    }
    get icon() {
        let ico = this.itemWithRef('l_icon');
        return ico?.icon;
    }
    /**
     * change the button right icon
     * todo: do nothing if no icon defined at startup
     *
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello',
     *  icon: 'close'
     * });
     * btn.setIcon( 'open' );
     * ```
     */
    set rightIcon(icon) {
        this.m_props.rightIcon = icon;
        let ico = this.itemWithRef('r_icon');
        if (ico) {
            ico.icon = icon;
        }
    }
    get rightIcon() {
        let ico = this.itemWithRef('l_icon');
        return ico?.icon;
    }
    /**
     *
     */
    set menu(items) {
        this.m_props.menu = items;
    }
}
exports.BaseButton = BaseButton;
// :: BUTTON ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
/**
 *
 */
class Button extends BaseButton {
}
exports.Button = Button;
/**
 *
 */
class ToggleButton extends BaseButton {
    constructor(props) {
        super(props);
    }
    /**
     *
     */
    render(props) {
        super.render(props);
        if (props.checked) {
            this.addClass('checked');
            this._updateIcon();
        }
    }
    /**
     *
     */
    _sendClick() {
        super._sendClick();
        this.m_props.checked = !this.m_props.checked;
        this.setClass('checked', this.m_props.checked);
        this.emit('change', (0, x4_events_1.EvChange)(this.m_props.checked));
        this._updateIcon();
    }
    _updateIcon() {
        if (this.m_props.checkedIcon) {
            const ic = this.m_props.checked ? this.m_props.checkedIcon : this.m_props.icon;
            let ico = this.itemWithRef('l_icon');
            if (ico) {
                ico.icon = ic;
            }
        }
    }
}
exports.ToggleButton = ToggleButton;
