"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file dialog.ts
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
exports.Dialog = exports.EvBtnClick = void 0;
const popup_1 = require("./popup");
const icon_1 = require("./icon");
const layout_1 = require("./layout");
const label_1 = require("./label");
const form_1 = require("./form");
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const tools_1 = require("./tools");
function EvBtnClick(button) {
    return (0, x4_events_1.BasicEvent)({ button });
}
exports.EvBtnClick = EvBtnClick;
/**
 * Standard dialog class
 */
class Dialog extends popup_1.Popup {
    m_icon;
    m_title;
    m_form;
    m_buttons;
    m_closable;
    m_movable;
    m_maximized;
    m_minimized;
    m_maximizable;
    m_minimizable;
    m_minFormSize;
    m_rc_max;
    m_rc_min;
    m_el_title;
    m_last_down;
    m_auto_close;
    m_ui_title;
    m_form_cb;
    constructor(props) {
        let content = props.content;
        props.content = null;
        let width = props.width;
        let height = props.height;
        props.width = undefined;
        props.height = undefined;
        super(props);
        this.m_minFormSize = { width, height };
        this.enableMask(true);
        if (props.form) {
            if (!(0, tools_1.isFunction)(props.form)) {
                this.m_form = props.form;
                this.m_form.on('btnClick', (e) => this._handleClick(e));
            }
            else {
                this.m_form_cb = props.form;
            }
        }
        else {
            this.m_form = new form_1.Form({
                content,
                buttons: props.buttons,
                disableSuggestions: props.disableSuggestions,
                btnClick: (e) => this._handleClick(e)
            });
        }
        this.m_movable = props.movable;
        this.m_auto_close = props.autoClose ?? true;
        this.m_icon = props.icon;
        this.m_title = props.title;
        this.m_buttons = props.buttons ?? null;
        this.m_closable = props.closable ?? false;
        this.m_last_down = 0;
        this.on('size', (ev) => {
            this.addClass('@resized');
            this.m_form.setStyleValue('width', null);
            this.m_form.setStyleValue('height', null);
        });
        this.m_maximized = false;
        this.m_minimized = false;
        this.m_maximizable = false;
        this.m_minimizable = false;
        if (props.maximizable !== undefined) {
            this.m_maximizable = props.maximizable;
        }
        if (props.minimizable !== undefined) {
            this.m_minimizable = props.minimizable;
        }
        if (props.maximized == true) {
            this.m_maximizable = true;
        }
        if (props.btnClick) {
            this.on('btnClick', props.btnClick);
        }
    }
    /**
     *
     */
    componentCreated() {
        super.componentCreated();
        if (this.m_minFormSize.width) {
            this.m_form.setStyle({
                minWidth: this.m_minFormSize.width,
                width: this.m_minFormSize.width
            });
        }
        if (this.m_minFormSize.height) {
            this.m_form.setStyle({
                minHeight: this.m_minFormSize.height,
                height: this.m_minFormSize.height
            });
        }
        const rc = this.getBoundingRect();
        this.setStyleValue('min-width', rc.width);
        this.setStyleValue('min-height', rc.height);
        this.setStyleValue('width', rc.width);
        this.setStyleValue('height', rc.height);
        if (this.m_props.dlgWidth) {
            this.setStyleValue('width', this.m_props.dlgWidth + '%');
        }
        if (this.m_props.dlgHeight) {
            this.setStyleValue('height', this.m_props.dlgHeight + '%');
        }
        this.addClass('@resized');
        if (this.m_props.maximized) {
            this._maximize();
            this.emit('size', (0, component_1.EvSize)(null));
        }
        else {
            this.centerOnScreen();
        }
    }
    /**
     *
     */
    _handleClick(ev) {
        this.emit('btnClick', ev);
        if (!ev.defaultPrevented) {
            this.close();
        }
    }
    /**
     * restore the geometry
     */
    setGeometry(geom) {
        if (geom.minimized && this.m_minimizable) {
            this._minimize(false);
            this.m_rc_min = new tools_1.Rect(geom.left, geom.top, geom.width, geom.height);
            this.displayAt(geom.left, geom.top, 'top-left');
        }
        else if (geom.maximized && this.m_maximizable) {
            this._maximize(false);
            this.m_rc_max = new tools_1.Rect(geom.left, geom.top, geom.width, geom.height);
        }
        else {
            this.setSize(geom.width, geom.height);
            this.displayAt(geom.left, geom.top, 'top-left');
        }
    }
    /**
     * return the geometry (usefull to save state)
     */
    getGeometry() {
        if (this.m_minimized) {
            return {
                left: this.m_rc_min.left,
                top: this.m_rc_min.top,
                width: this.m_rc_min.width,
                height: this.m_rc_min.height,
                minimized: true,
                maximized: false
            };
        }
        else if (this.m_maximized) {
            return {
                left: this.m_rc_max.left,
                top: this.m_rc_max.top,
                width: this.m_rc_max.width,
                height: this.m_rc_max.height,
                minimized: false,
                maximized: true
            };
        }
        let rc = this.getBoundingRect();
        return {
            left: rc.left,
            top: rc.top,
            width: rc.width,
            height: rc.height,
            minimized: false,
            maximized: false
        };
    }
    /**
     * resize the dialog
     * @param width
     * @param height
     */
    setSize(width, height) {
        this.setStyle({ width, height });
        this.emit('size', (0, component_1.EvSize)({ width, height }));
    }
    /** @ignore */
    render() {
        if (this.m_form_cb) {
            this.m_form = this.m_form_cb();
            this.m_form.on('btnClick', (e) => this._handleClick(e));
            this.m_form_cb = null;
        }
        let hasTitle = this.m_icon !== undefined || this.m_closable || this.m_title !== undefined || this.m_movable;
        this.m_el_title = null;
        if (hasTitle) {
            this.m_el_title = new layout_1.HLayout({
                cls: 'title',
                content: [
                    this.m_icon ? new icon_1.Icon({ icon: this.m_icon }) : null,
                    this.m_ui_title = new label_1.Label({ flex: 1, text: this.m_title }),
                    this.m_minimizable ? new icon_1.Icon({ cls: 'min-btn', icon: 'var( --x4-icon-window-minimize )', dom_events: { click: () => this._toggleMin() } }) : null,
                    this.m_maximizable ? new icon_1.Icon({ cls: 'max-btn', icon: 'var( --x4-icon-window-maximize )', dom_events: { click: () => this._toggleMax() } }) : null,
                    this.m_maximizable ? new icon_1.Icon({ cls: 'res-btn', icon: 'var( --x4-icon-window-restore )', dom_events: { click: () => this._toggleMax() } }) : null,
                    this.m_closable ? new icon_1.Icon({ cls: 'close-btn', icon: 'var( --x4-icon-rectangle-times )', dom_events: { click: () => this.close() } }) : null,
                ]
            });
            if (this.m_movable) {
                if ((0, tools_1.isTouchDevice)()) {
                    this.m_el_title.setDomEvent('touchstart', (e) => this._mouseDown(e));
                }
                else {
                    this.m_el_title.setDomEvent('mousedown', (e) => this._mouseDown(e));
                }
            }
        }
        super.setContent([
            this.m_el_title,
            this.m_form
        ]);
    }
    /**
     * change the dialog content
     * @param els
     * @param refreshAll
     */
    setContent(els, refreshAll = true) {
        this.m_form.setContent(els, refreshAll);
    }
    /**
     * change the dialog buttons
     * @param buttons
     */
    setButtons(buttons) {
        this.m_form.setButtons(buttons);
    }
    /**
     * return the dialog form
     */
    get form() {
        return this.m_form;
    }
    /**
     * close the dialog
     */
    close() {
        this.emit('close', {});
        super.close();
    }
    /**
     *
     */
    _toggleMax() {
        if (!this.m_maximizable) {
            return;
        }
        if (this.m_maximized) {
            this.removeClass('maximized');
            this.setStyle({
                left: this.m_rc_max.left,
                top: this.m_rc_max.top,
                width: this.m_rc_max.width,
                height: this.m_rc_max.height,
            });
            this.m_maximized = false;
            this.emit('size', (0, component_1.EvSize)(null, 'restore'));
        }
        else {
            this._maximize();
            this.emit('size', (0, component_1.EvSize)(null, 'maximize'));
        }
    }
    /**
     *
     */
    _toggleMin() {
        if (!this.m_minimizable) {
            return;
        }
        if (this.m_minimized) {
            this.removeClass('minimized');
            this.setStyle({
                //left: 	this.m_rc_min.left,
                //top: 	this.m_rc_min.top,
                width: this.m_rc_min.width,
                height: this.m_rc_min.height,
            });
            this.m_minimized = false;
            this.emit('size', (0, component_1.EvSize)(null, 'restore'));
        }
        else {
            this._minimize();
            this.emit('size', (0, component_1.EvSize)(null, 'minimize'));
        }
    }
    /**
     *
     */
    _mouseDown(event) {
        let { x, y } = (0, tools_1.getMousePos)(event, true);
        let wrc = (0, component_1.flyWrap)(document.body).getBoundingRect();
        let rc = this.getBoundingRect(true);
        let trc = this.m_el_title.getBoundingRect();
        let dx = x - rc.left, dy = y - rc.top;
        let cstyle = this.getComputedStyle();
        let topw = cstyle.parse('marginTop') + cstyle.parse('paddingTop') + cstyle.parse('borderTopWidth');
        let botw = cstyle.parse('marginBottom') + cstyle.parse('paddingBottom') + cstyle.parse('borderBottomWidth');
        let lftw = cstyle.parse('marginLeft') + cstyle.parse('paddingLeft') + cstyle.parse('borderLeftWidth');
        let rgtw = cstyle.parse('marginRight') + cstyle.parse('paddingRight') + cstyle.parse('borderRightWidth');
        wrc.top += topw - trc.height;
        wrc.height -= topw + botw - trc.height;
        wrc.left += lftw;
        wrc.width -= lftw + rgtw;
        // custom handling double click
        const now = Date.now();
        const delta = now - this.m_last_down;
        if (this.m_maximizable && delta < 700) {
            this._toggleMax();
            return;
        }
        this.m_last_down = now;
        if (this.m_maximized) {
            // cannot move in max state
            return;
        }
        let __move = (ex, ey) => {
            let x = ex - dx, y = ey - dy;
            if (x + rc.width < wrc.left) {
                x = wrc.left - rc.width;
            }
            else if (x > wrc.right) {
                x = wrc.right;
            }
            if (y < wrc.top) { // title grip is on top
                y = wrc.top;
            }
            else if (y > wrc.bottom) {
                y = wrc.bottom;
            }
            this.setStyle({
                left: x,
                top: y
            });
        };
        component_1.Component.setCapture(this, (ev) => {
            if (ev.type == 'mousemove') {
                let mev = ev;
                __move(mev.clientX, mev.clientY);
            }
            else if (ev.type == 'touchmove') {
                let tev = ev;
                if (tev.touches.length == 1) {
                    __move(tev.touches[0].clientX, tev.touches[0].clientY);
                }
            }
            else if (ev.type == 'mouseup' || ev.type == 'touchend') {
                component_1.Component.releaseCapture();
                this.emit('move', (0, popup_1.EvMove)(null));
            }
            else if (ev.type == 'mousedown' || ev.type == 'touchstart') {
            }
        });
    }
    /**
     * maximize the dialog
     */
    maximize() {
        if (!this.m_maximizable || this.m_maximized) {
            return;
        }
        this._maximize();
        this.emit('size', (0, component_1.EvSize)(null));
    }
    /**
     *
     */
    _maximize(saveRect = true) {
        if (saveRect) {
            this.m_rc_max = this.getBoundingRect(false);
        }
        this.addClass('maximized');
        this.m_maximized = true;
        this.setStyle({
            left: undefined,
            top: undefined,
            width: undefined,
            height: undefined,
        });
    }
    /**
     * minimize the dialog
     */
    minimize() {
        if (!this.m_minimizable || this.m_minimized) {
            return;
        }
        this._minimize();
        this.emit('size', (0, component_1.EvSize)(null));
    }
    /**
     *
     */
    _minimize(saveRect = true) {
        if (saveRect) {
            this.m_rc_min = this.getBoundingRect(false);
        }
        this.addClass('minimized');
        this.m_minimized = true;
        this.setStyle({
            //left: undefined,
            //top: undefined,
            width: undefined,
            height: undefined,
        });
    }
    /**
     * change the dialog title
     */
    set title(title) {
        this.m_title = title;
        if (this.m_ui_title) {
            this.m_ui_title.text = title;
        }
    }
    itemWithName(name) {
        let result = this.dom.querySelector(`[name="${name}"]`);
        return result ? component_1.Component.getElement(result) : null;
    }
    getValues() {
        return this.m_form.getValues();
    }
    validate() {
        return this.m_form.validate();
    }
}
exports.Dialog = Dialog;
