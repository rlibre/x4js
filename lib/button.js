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
exports.ToggleButton = exports.Button = exports.BaseButton = void 0;
const component_1 = require("./component");
const x4events_1 = require("./x4events");
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
        this.setTag('button');
        this.setDomEvent('click', (e) => this._handleClick(e));
        this.setDomEvent('mousedown', () => { this._startAutoRep(true); });
        this.setDomEvent('mouseup', () => { this._startAutoRep(false); });
        this.setDomEvent('keydown', (e) => this._handleKeyDown(e));
        this.mapPropEvents(props, 'click');
    }
    render(props) {
        const action = props.action;
        let icon = props.icon;
        let text = props.text;
        if (action) {
            if (!icon && action.props.icon) {
                icon = action.props.icon;
            }
            if (text === undefined && action.props.text) {
                text = action.props.text;
            }
        }
        const ui_icon = icon ? new icon_1.Icon({ icon, cls: 'left', ref: 'l_icon' }) : null;
        const ui_label = new label_1.Label({ flex: 1, text: text ?? '', align: props.align, ref: 'label' });
        const ui_ricon = props.rightIcon ? new icon_1.Icon({ icon: props.rightIcon, cls: 'right', ref: 'r_icon' }) : null;
        if (text === undefined) {
            ui_label.addClass("@hidden");
        }
        this.setContent([ui_icon, ui_label, ui_ricon]);
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
            this.emit('click', (0, x4events_1.EvClick)());
            if (this.m_props.action) {
                this.m_props.action.fire();
            }
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
            label.removeClass("@hidden");
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
        this.emit('change', (0, x4events_1.EvChange)(this.m_props.checked));
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
