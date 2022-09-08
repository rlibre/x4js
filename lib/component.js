"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
 * @file components.ts
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
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.SizerOverlay = exports.EvOverlayResize = exports.Separator = exports.EvSize = exports.Space = exports.Flex = exports.flyWrap = exports.Component = exports.EvFocus = exports.EvDblClick = exports._x4_unitless = exports.html = exports.isHtmlString = exports.HtmlString = void 0;
/**
 * @todo
 *		create Container class
 */
const tools_1 = require("./tools");
const x4dom_1 = require("./x4dom");
const styles_1 = require("./styles");
const x4events_1 = require("./x4events");
const base_component_1 = require("./base_component");
var tools_2 = require("./tools");
Object.defineProperty(exports, "HtmlString", { enumerable: true, get: function () { return tools_2.HtmlString; } });
Object.defineProperty(exports, "isHtmlString", { enumerable: true, get: function () { return tools_2.isHtmlString; } });
Object.defineProperty(exports, "html", { enumerable: true, get: function () { return tools_2.html; } });
/** @ignore classname prefix for system classes */
const _x4_ns_prefix = 'x-';
// -- elements -----------
/** @ignore where event handlers are stored */
const _x4_el_store = Symbol();
/** @ignore where Component is stored in dom */
const _x4_el_sym = Symbol();
/** @ignore properties without 'px' unit */
exports._x4_unitless = {
    animationIterationCount: 1, borderImageOutset: 1, borderImageSlice: 1, borderImageWidth: 1, boxFlex: 1, boxFlexGroup: 1,
    boxOrdinalGroup: 1, columnCount: 1, flex: 1, flexGrow: 1, flexPositive: 1, flexShrink: 1, flexNegative: 1, flexOrder: 1,
    gridRow: 1, gridColumn: 1, fontWeight: 1, lineClamp: 1, lineHeight: 1, opacity: 1, order: 1, orphans: 1, tabSize: 1, widows: 1,
    zIndex: 1, zoom: 1,
    // SVG-related _properties
    fillOpacity: 1, floodOpacity: 1, stopOpacity: 1, strokeDasharray: 1, strokeDashoffset: 1, strokeMiterlimit: 1, strokeOpacity: 1,
    strokeWidth: 1,
};
/** @ignore this events must be defined on domNode (do not bubble) */
const unbubbleEvents = {
    mouseleave: 1, mouseenter: 1, load: 1, unload: 1, scroll: 1, focus: 1, blur: 1, rowexit: 1, beforeunload: 1, stop: 1,
    dragdrop: 1, dragenter: 1, dragexit: 1, draggesture: 1, dragover: 1, contextmenu: 1, create: 2, sizechange: 2
};
/** @ignore */
const passiveEvents = {
    touchstart: 1, touchmove: 1, touchend: 1,
    //pointerdown: 1, pointermove: 1, pointerup: 1,
};
/** ignore */
const reNumber = /^-?\d+(\.\d+)?$/;
function EvDblClick(context = null) {
    return (0, x4events_1.BasicEvent)({ context });
}
exports.EvDblClick = EvDblClick;
function EvFocus(focus = true, context = null) {
    return (0, x4events_1.BasicEvent)({ focus, context });
}
exports.EvFocus = EvFocus;
/**
 *
 */
class Component extends base_component_1.BaseComponent {
    m_dom;
    m_iprops;
    static __sb_width; // scrollbar width
    static __comp_guid = 1000; // component global unique id
    static __privateEvents = {};
    static __sizeObserver; // resize observer
    static __createObserver; // creation observer
    //private static __intersectionObserver: IntersectionObserver;	// visibility observer
    static __capture = null;
    static __capture_mask = null;
    static __css = null;
    constructor(props = null) {
        super(props ?? {});
        this.m_iprops = {
            classes: {},
            dom_events: {},
            uid: Component.__comp_guid++,
            inrender: false,
        };
        // prepare iprops
        if (this.m_props.cls) {
            this.addClass(this.m_props.cls);
        }
    }
    /**
     *
     */
    get uid() {
        return this.m_iprops.uid;
    }
    /**
     * change the component content
     * @param content new content or null
     */
    setContent(content, refreshAll = false) {
        this.m_props.content = content ?? [];
        if (this.m_iprops.inrender || !this.m_dom) {
            return;
        }
        if (refreshAll) {
            this.update();
        }
        else {
            this._updateContent();
        }
    }
    /**
     * add a new child to the component content
     * @param content
     */
    appendChild(content) {
        if (!content) {
            return;
        }
        const append = (c) => {
            if (!this.m_props.content) {
                this.m_props.content = [];
            }
            else if (!(0, tools_1.isArray)(this.m_props.content)) {
                this.m_props.content = [this.m_props.content];
            }
            this.m_props.content.push(c);
            if (this.m_dom) {
                this._appendChild(c);
            }
        };
        if ((0, tools_1.isArray)(content)) {
            content.forEach(append);
        }
        else {
            append(content);
        }
    }
    /**
     *
     */
    setTag(tag, namespace) {
        this.m_props.tag = tag;
        if (namespace) {
            this.m_props.ns = namespace;
        }
    }
    /**
     * get the Component value
     * @param name name to get
     * /

    getProp(name: string): any {
        return this.m_props[name];
    }

    / **
     * change a Component value
     * @param name name to set
     * @param value new value
     * /

    setProp(name: string, value?: any) {
        (this.m_props as any)[name] = value;
    }
    */
    /**
     * get the Component data value
     * @param name name to get
     */
    getData(name) {
        if (this.m_props.data !== undefined) {
            return this.m_props.data[name.toString()];
        }
        return undefined;
    }
    /**
     * set the Component data value
     * @param name name to get
     * @param value
     */
    setData(name, value) {
        let data = this.m_props.data;
        if (data === undefined) {
            data = this.m_props.data = {};
        }
        data[name.toString()] = value;
    }
    /**
     * return the DOM associated with the Component (if any)
     */
    get dom() {
        return this.m_dom;
    }
    /**
     * shows the element
     * @param show
     */
    show(show) {
        if (show === undefined || show === true) {
            this.removeClass('@hidden');
        }
        else {
            this.addClass('@hidden');
        }
    }
    /**
     * hides the element
     */
    hide() {
        this.addClass('@hidden');
    }
    /**
     * enable or disable the element
     * @param enable
     */
    enable(enable) {
        if (enable === undefined || enable === true) {
            this.removeClass('@disable');
            this.removeAttribute('disabled');
        }
        else {
            this.disable();
        }
    }
    /**
     * disable the element
     */
    disable() {
        this.addClass('@disable');
        this.setAttribute('disabled', '');
    }
    /**
     * set the focus on the element
     */
    focus() {
        console.assert(!!this.m_dom);
        this.m_dom.focus();
    }
    /**
     * change the object style
     * @param style - style to add
     * @example ```typescript
     * el.setStyle( {left:100} );
     */
    setStyle(style) {
        for (let s in style) {
            this.setStyleValue(s, style[s]);
        }
    }
    /**
     * change a style value
     * @param name string style nale
     * @param value any style value or null to remove style
     */
    setStyleValue(name, value) {
        let style = this.m_props.style;
        if (!style) {
            style = this.m_props.style = {};
        }
        style[name] = value;
        this._setDomStyleValue(name, value);
    }
    _setDomStyleValue(name, value) {
        if (this.m_dom) {
            if (value === undefined) {
                value = null;
            }
            else if (!exports._x4_unitless[name] && ((0, tools_1.isNumber)(value) || reNumber.test(value))) {
                value = value + 'px';
            }
            this.m_dom.style[name] = value;
        }
    }
    /**
     * compute the element style
     * @return all styles computed
     */
    getComputedStyle(pseudoElt) {
        if (this.dom) {
            return new styles_1.ComputedStyle(getComputedStyle(this.dom, pseudoElt ?? null));
        }
        return new styles_1.ComputedStyle(this.m_props.style);
    }
    /**
     * return a single stype value
     * @param name - value to get
     */
    getStyleValue(name) {
        return this.getComputedStyle()[name];
    }
    /**
     * define the elements attributes
     * @param attrs
     */
    setAttributes(attrs) {
        for (let a in attrs) {
            this.setAttribute(a, attrs[a]);
        }
    }
    /**
     * change a single attribute
     * @param name attribute name
     * @param value new value
     */
    setAttribute(name, value) {
        if (value === false || value === undefined) {
            this.removeAttribute(name);
        }
        else {
            if (value === true) {
                value = '';
            }
            else if ((0, tools_1.isNumber)(value)) {
                value = '' + value;
            }
            let attrs = this.m_props.attrs;
            if (!attrs) {
                attrs = this.m_props.attrs = {};
            }
            attrs[name] = value;
            this._setDomAttribute(name, value);
        }
    }
    _setDomAttribute(name, value) {
        if (this.m_dom) {
            this.m_dom.setAttribute(name, value);
        }
    }
    /**
     * remove an atrribute
     * @param name name of the attribute
     */
    removeAttribute(name) {
        let attrs = this.m_props.attrs;
        if (!attrs) {
            return;
        }
        delete attrs[name];
        if (this.m_dom) {
            this.m_dom.removeAttribute(name);
        }
    }
    /**
     * get an attribute value
     * @param {string} name - attribute name
     * @return {string} attribute value
     * @example ```typescript
     * let chk = el.getAttribute( 'checked' );
     * @review double cache
     */
    getAttribute(name) {
        if (this.m_dom) {
            return this.m_dom.getAttribute(name);
        }
        else {
            if (!this.m_props.attrs) {
                return undefined;
            }
            return this.m_props.attrs[name];
        }
    }
    /**
     * check if the element has an attribute
     * @param name attribute name
     * @return true is attribute is present
     * @example ```typescript
     * if( el.hasAttribute('checked') ) {
     * }
     */
    hasAttribute(name) {
        if (this.m_dom) {
            return this.m_dom.hasAttribute(name);
        }
        else {
            return this.m_props.attrs.hasOwnProperty(name);
        }
    }
    /**
     * a some classnames to the component
     * classes can be separated by a space
     * @param cls class to add
     * @example ```typescript
     * addClass( 'my class name @flex' );
     */
    addClass(name) {
        if (name === null || name === undefined) {
            return;
        }
        name = name.trim();
        if (name === '') {
            return;
        }
        let add = (c) => {
            if (c === undefined || c === null || c === '') {
                return;
            }
            c = this._makeCls(c);
            // update vdom
            classes[c] = true;
            // update dom
            if (this.m_dom) {
                this.m_dom.classList.add(c);
            }
        };
        let classes = this.m_iprops.classes;
        if (name.indexOf(' ') < 0) {
            add(name);
        }
        else {
            let names = name.split(' ');
            names.forEach((n) => add(n));
        }
    }
    /**
     * Remove a class from the element
     * @param {string|array} name - classes in string form can be space separated
     *
     * @example ```typescript
     * el.removeClass( 'myclass' );
     * el.removeClass( 'myclass1 myclass2' );
     */
    removeClass(name) {
        if (name === undefined) {
            return;
        }
        let remove = (c) => {
            if (c === undefined || c === null || c === '') {
                return;
            }
            c = this._makeCls(c);
            delete this.m_iprops.classes[c];
            if (this.m_dom) {
                this.m_dom.classList.remove(c);
            }
        };
        // faster
        if (name.indexOf(' ') < 0) {
            remove(name);
        }
        else {
            //  build class list
            let classes = name.trim().split(' ');
            for (let c of classes) {
                if (c !== undefined && c !== null && c !== '') {
                    remove(c);
                }
            }
        }
    }
    /**
     *
     * @param cls
     * @param set
     */
    setClass(cls, set) {
        if (set) {
            this.addClass(cls);
        }
        else {
            this.removeClass(cls);
        }
        return this;
    }
    /**
     * Toggle a class from the element (if present remove, if absent add)
     * @param {string|string[]} name - classes in string form can be space separated
     * @example ```typescript
     * el.toggleClass( 'myclass' );
     * el.toggleClass( 'myclass1 myclass2');
     * el.toggleClass( ['myclass1','myclass2']);
     */
    toggleClass(name) {
        let toggle = (c) => {
            if (c === undefined && c === null && c === '') {
                return;
            }
            c = this._makeCls(c);
            if (this.m_iprops.classes[c]) {
                delete this.m_iprops.classes[c];
            }
            else {
                this.m_iprops.classes[c] = true;
            }
            if (this.m_dom) {
                this.m_dom.classList.toggle(c);
            }
        };
        // faster
        if (name.indexOf(' ') < 0) {
            toggle(name);
        }
        else {
            //  build class list
            let classes = name.trim().split(' ');
            for (let c of classes) {
                toggle(c);
            }
        }
    }
    /**
     * check if the object has the class
     * @param cls
     */
    hasClass(cls) {
        let c = this._makeCls(cls);
        if (this.m_dom) {
            return this.dom.classList.contains(c);
        }
        else {
            return !!this.m_iprops.classes[c];
        }
    }
    /**
     * remove all classes from the object
     * this is usefull for component recycling & reusing
     */
    clearClasses() {
        this.m_iprops.classes = {};
        if (this.m_dom) {
            return this.m_dom.classList.value = '';
        }
    }
    _build() {
        if (this.m_dom) {
            return this.m_dom;
        }
        this._createDOM();
        return this.m_dom;
    }
    render(props) {
        if (this.m_props.tag == 'footer') {
            debugger;
        }
    }
    _createDOM() {
        if (this.m_dom) {
            return this.m_dom;
        }
        // setup props
        const props = this.m_props;
        if (props.tabIndex !== undefined) {
            this._setTabIndex(props.tabIndex);
        }
        this.render(props);
        // shortcuts ---------
        if (props.left !== undefined) {
            this.setStyleValue('left', props.left);
        }
        if (props.top !== undefined) {
            this.setStyleValue('top', props.top);
        }
        if (props.width !== undefined) {
            this.setStyleValue('width', props.width);
        }
        if (props.height !== undefined) {
            this.setStyleValue('height', props.height);
        }
        if (props.flex !== undefined) {
            this.addClass('@flex');
            if (props.flex != 1) {
                this.setStyleValue('flex', props.flex);
            }
        }
        if (props.enabled === false) {
            this.disable();
        }
        // shortcut: tip
        if (props.tooltip !== undefined) {
            this.setAttribute('tip', props.tooltip.replace(/\n/gi, '<br/>'));
        }
        // prepare iprops
        if (props.dom_events) {
            for (let ename in props.dom_events) {
                this._setDomEvent(ename, props.dom_events[ename]);
            }
        }
        this._genClassName();
        this.m_props.cls = undefined; // now classes are tranfered to m_iprops
        // create self
        let vdom = this.m_iprops;
        if (props.ns) {
            this.m_dom = x4dom_1.x4document.createElementNS(props.ns, props.tag ?? 'div');
        }
        else {
            this.m_dom = x4dom_1.x4document.createElement((props.tag ?? 'div'));
        }
        this.m_dom[_x4_el_sym] = this;
        //let me = Object.getPrototypeOf(this);
        //console.log( 'create', this.m_iprops.uid, me.constructor.name );
        // classes
        this.m_dom.classList.add(...Object.keys(vdom.classes));
        // styles
        let sty = props.style;
        if (sty) {
            for (let s in sty) {
                this._setDomStyleValue(s, sty[s]);
            }
        }
        // attributes
        let att = props.attrs;
        if (att) {
            for (let a in att) {
                const attr = att[a];
                if (attr !== false && attr !== undefined) {
                    this._setDomAttribute(a, att[a]);
                }
            }
        }
        // special properties
        if (this.m_props.id) {
            this._setDomAttribute('id', this.m_props.id);
        }
        // events
        let evt = this.m_iprops.dom_events;
        if (evt) {
            for (let e in evt) {
                let handlers = evt[e];
                for (let h of handlers) {
                    this.createEvent(e, h);
                }
            }
        }
        // create children
        let content = props.content;
        if (content) {
            if (!(0, tools_1.isArray)(content)) {
                content = [content];
            }
            content.forEach((el) => {
                if (!el) {
                    return;
                }
                if ((0, tools_1.isString)(el)) {
                    this.m_dom.insertAdjacentText('beforeend', el);
                }
                else if ((0, tools_1.isHtmlString)(el)) {
                    this.m_dom.insertAdjacentHTML('beforeend', el);
                }
                else if (el instanceof Component) {
                    this.m_dom.append(el._build());
                }
                else {
                    console.log('unknown element type: ', el);
                }
            });
        }
        // wait for dom insertion inside document.body
        if (!Component.__createObserver) {
            Component.__createObserver = new MutationObserver(Component._observeCreation);
            Component.__createObserver.observe(x4dom_1.x4document.body, { childList: true, subtree: true });
        }
        return this.m_dom;
    }
    _setTabIndex(tabIndex, defValue = 0) {
        if (tabIndex === true) {
            tabIndex = 0;
        }
        else if (tabIndex === undefined) {
            tabIndex = defValue;
        }
        if (tabIndex !== false && tabIndex !== undefined) {
            this.setAttribute('tabindex', tabIndex);
        }
        this.m_props.tabIndex = tabIndex;
    }
    static _observeCreation(mutations) {
        // notify descendants that we have been created (dom exists)
        for (let mutation of mutations) {
            if (mutation.type == 'childList') {
                for (let i = 0, n = mutation.addedNodes.length; i < n; i++) {
                    let add = mutation.addedNodes[i];
                    let el = add[_x4_el_sym];
                    if (el) {
                        el.enumChilds((c) => {
                            if (c.dom && c.m_iprops.dom_events && c.m_iprops.dom_events.create) {
                                c.dom.dispatchEvent(new Event('create'));
                            }
                            c.componentCreated();
                        }, true);
                        if (el.m_iprops.dom_events && el.m_iprops.dom_events.create) {
                            el.dom.dispatchEvent(new Event('create'));
                        }
                        el.componentCreated();
                    }
                }
            }
        }
    }
    dispose() {
        if (this.m_dom) {
            this._dispose(true, true);
        }
    }
    _dispose(with_dom, timers) {
        let _dom = this.m_dom;
        // free attached resources
        delete _dom[_x4_el_sym];
        delete _dom[_x4_el_store];
        //
        if (with_dom) {
            _dom.remove();
        }
        // notify every child that they will be removed
        this.enumChilds((c) => {
            c._dispose(false, true);
        });
        this.m_dom = null;
        if (timers) {
            this.disposeTimers();
        }
        this.componentDisposed();
        // todo: pb on update this.removeAllListeners( null );
    }
    componentDisposed() {
    }
    componentCreated() {
    }
    /**
     *
     */
    update(delay = 0) {
        if (this.m_dom) {
            const _update = () => {
                let oldDOM = this.m_dom;
                this._dispose(false, false);
                let newDOM = this._build();
                console.assert(!!oldDOM.parentNode, 'update in componentCreated is not allowed, use updateContent');
                oldDOM.parentNode.replaceChild(newDOM, oldDOM);
            };
            if (delay) {
                this.singleShot(_update, delay);
            }
            else {
                _update();
            }
        }
    }
    /**
     * empty the node
     */
    _empty() {
        //this.m_dom.innerHTML = '';
        const el = this.m_dom;
        if (!el) {
            return;
        }
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
    _updateContent() {
        if (!this.m_dom) {
            return;
        }
        this._empty();
        let content = this.m_props.content;
        // create children
        if (content) {
            if (!(0, tools_1.isArray)(content)) {
                content = [content];
            }
            content.forEach((el) => {
                if (!el) {
                    return;
                }
                if ((0, tools_1.isHtmlString)(el)) {
                    this.m_dom.insertAdjacentHTML('beforeend', el);
                }
                else if (el instanceof Component) {
                    this.m_dom.append(el._build());
                }
                else {
                    this.m_dom.insertAdjacentText('beforeend', el + '');
                }
            });
        }
    }
    /**
     * @return the bounding rectangle
     * @example ```typescript
     * let rc = el.getBoundingRect( );
     * console.log( rc.left, rc.top, rc.right, rc.bottom );
     */
    getBoundingRect(withMargins = false) {
        console.assert(this.dom != null, 'cannot get bounding rect of an non DOM element');
        let r = this.dom.getBoundingClientRect();
        let rc = new tools_1.Rect(r.left, r.top, r.width, r.height);
        if (withMargins) {
            let st = this.getComputedStyle();
            let tm = st.parse('marginTop'), bm = st.parse('marginBottom'), lm = st.parse('marginLeft'), rm = st.parse('marginRight');
            rc.left -= lm;
            rc.width += lm + rm;
            rc.top -= tm;
            rc.height += tm + bm;
        }
        return rc;
    }
    /**
     * append a new dom event handler
     * @param name - you can specify multiple names separated by a space
     * @param handler
     * @example
     *
     * this.setDomEvent( 'drag drop', this._handleDrag, this );
     * this.setDomEvent( 'dblclick', this._handleDblClick, this );
     */
    setDomEvent(type, listener) {
        let _listener = listener;
        this._setDomEvent(type, _listener);
    }
    _setDomEvent(type, listener) {
        // add event to the vdom
        if (!this.m_iprops.dom_events) {
            this.m_iprops.dom_events = {};
        }
        let listeners = this.m_iprops.dom_events[type];
        if (!listeners) {
            listeners = this.m_iprops.dom_events[type] = [listener];
        }
        else {
            listeners.push(listener);
        }
        if (this.m_dom) {
            //this.m_dom.addEventListener(type, listener);
            this.createEvent(type, listener);
        }
    }
    /**
     *
     */
    clearDomEvent(type) {
        if (!this.m_iprops.dom_events) {
            return;
        }
        delete this.m_iprops.dom_events[type];
        let _dom = this.m_dom;
        if (_dom) {
            let store = _dom[_x4_el_store];
            if (store) {
                delete store[type];
            }
        }
    }
    /**
     *
     * @param name
     * @param handler
     */
    createEvent(name, handler) {
        let _dom = this.m_dom;
        let store = _dom[_x4_el_store];
        if (!store) {
            store = _dom[_x4_el_store] = {};
        }
        if (!store[name]) {
            // no handler for this event...
            store[name] = [handler];
        }
        else {
            // append the handler
            store[name].push(handler);
        }
        if (unbubbleEvents[name] === 1) {
            _dom['on' + name] = Component._dispatchUnbubbleEvent;
        }
        else if (!Component.__privateEvents[name]) {
            Component.__privateEvents[name] = true; // todo count it
            if (passiveEvents[name]) {
                x4dom_1.x4document.addEventListener(name, Component._dispatchEvent, { passive: false, capture: true });
            }
            else {
                x4dom_1.x4document.addEventListener(name, Component._dispatchEvent, true);
            }
        }
        if (name === 'sizechange') {
            if (!Component.__sizeObserver) {
                Component.__sizeObserver = new ResizeObserver(Component._observeSize);
            }
            Component.__sizeObserver.observe(this.m_dom);
        }
    }
    /**
     * dispatch a dom event to the appropriated component
     * called by the system
     */
    static _dispatchEvent(ev) {
        let target = ev.target, noup = unbubbleEvents[ev.type] === 2;
        while (target) {
            if (target[_x4_el_store]) {
                let store = target[_x4_el_store][ev.type];
                if (store) {
                    let el = target[_x4_el_sym];
                    let root = el?.root ?? null;
                    if (store instanceof Array) {
                        store.some((fn) => {
                            fn(ev, root);
                            if (!el.dom) {
                                return true;
                            }
                        });
                    }
                    else {
                        store(ev, root);
                    }
                    if (ev.cancelBubble || ev.defaultPrevented || noup) {
                        break;
                    }
                }
            }
            target = target.parentNode;
            // no need to go above
            if (target == document) {
                break;
            }
        }
    }
    /**
     * dispatch a dom event to the appropriated component
     * called by the system
     */
    static _dispatchUnbubbleEvent(ev) {
        let target = ev.currentTarget || ev.target, eventType = ev.type;
        let eventStore = target[_x4_el_store], store = eventStore && eventStore[eventType];
        if (store) {
            let el = target[_x4_el_sym];
            let root = el?.root ?? null;
            if (store instanceof Array) {
                store.forEach((fn) => {
                    fn(ev, root);
                });
            }
            else {
                store(ev, root);
            }
        }
    }
    /**
     * called when a size change on an observed component
     */
    static _observeSize(entries) {
        entries.forEach((entry) => {
            let dom = entry.target;
            if (dom.offsetParent !== null) {
                dom.dispatchEvent(new Event('sizechange'));
            }
        });
    }
    /**
     * enum all children recursively
     * @param recursive - if true do a full sub-child search
     * @param cb - callback
     * return true to stop enumeration
     */
    enumChilds(cb, recursive = false) {
        // use dom if available
        if (this.m_dom) {
            let el = this.m_dom.firstChild;
            while (el) {
                // get component (if any)
                let cel = el[_x4_el_sym];
                if (cel) {
                    cb(cel);
                    if (recursive && cel.enumChilds(cb, true) === true) {
                        return true;
                    }
                }
                el = el.nextSibling;
            }
        }
        else {
            let content = this.m_props.content;
            if (!content) {
                return;
            }
            if (!(0, tools_1.isArray)(content)) {
                content = [content];
            }
            content.some((el) => {
                if (!el || (0, tools_1.isString)(el) || (0, tools_1.isHtmlString)(el)) {
                    return;
                }
                if (cb(el)) {
                    return true;
                }
                if (recursive && el.enumChilds(cb, true) === true) {
                    return true;
                }
            });
        }
        return false;
    }
    /**
     * apprend a child to the DOM
     * @param props child to append (or string)
     */
    _appendChild(el) {
        if ((0, tools_1.isString)(el)) {
            this.m_dom.insertAdjacentText('beforeend', el);
        }
        else if ((0, tools_1.isHtmlString)(el)) {
            this.m_dom.insertAdjacentHTML('beforeend', el);
        }
        else {
            let component = el;
            try {
                component._build();
                this.m_dom.appendChild(component.m_dom);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    /**
     * generate classes from the component inheritance
     * @example
     * Button extends Component will give
     * x-comp x-button
     */
    _genClassName() {
        this.addClass('@comp');
        let me = Object.getPrototypeOf(this);
        while (me && me.constructor !== Component) {
            let clsname = me.constructor.name;
            this.addClass('@' + (0, tools_1.pascalCase)(clsname));
            me = Object.getPrototypeOf(me);
        }
        //done in ctor now
        //this.addClass(this.m_props.cls);
    }
    /**
     * prepend the system class name prefix on a name if needed (if class starts with @)
     */
    _makeCls(cls) {
        if (cls[0] == '@') {
            return cls = _x4_ns_prefix + cls.substring(1);
        }
        else {
            return cls;
        }
    }
    /**
     *
     */
    static dispatchCaptures(event) {
        Component.__capture.handler(event);
    }
    /**
     * capture mouse events
     * @param capture name of the current capture
     * @param callback funciton to call on captured mouse events
     *
     * @example
     * Component.setCapture( this, ( ev: MouseEvent, initiator: Component ) => {
     *		if( ev.type=='mousemove' ) {
     *			this.setStyle( {
     *				left: ev.clientX,
     *				top: ev.clientY
     *			} );
     *		}
     *		else if( ev.type=='mouseup' ) {
     *			Component.releaseCapture( );
     *		}
     *	} );
     */
    static setCapture(initiator, listener) {
        console.assert(!Component.__capture);
        if (Component.__capture) {
            debugger;
        }
        //	todo: review that
        let iframes = x4dom_1.x4document.querySelectorAll("iframe");
        iframes.forEach(f => {
            flyWrap(f).setStyleValue('pointer-events', 'none');
        });
        let overs = x4dom_1.x4document.querySelectorAll(":hover");
        let cursor = null;
        if (overs.length) {
            let elementOver = overs[overs.length - 1];
            let style = window.getComputedStyle(elementOver);
            cursor = style.cursor;
        }
        Component.__capture_mask = x4dom_1.x4document.createElement('div');
        let mask = flyWrap(Component.__capture_mask);
        mask.addClass('@capture-mask');
        if (cursor) {
            mask.setStyleValue('cursor', cursor);
        }
        x4dom_1.x4document.body.appendChild(mask.dom);
        x4dom_1.x4document.addEventListener('mousedown', Component.dispatchCaptures);
        x4dom_1.x4document.addEventListener('mousemove', Component.dispatchCaptures);
        x4dom_1.x4document.addEventListener('mouseup', Component.dispatchCaptures);
        x4dom_1.x4document.addEventListener('touchstart', Component.dispatchCaptures);
        x4dom_1.x4document.addEventListener('touchmove', Component.dispatchCaptures);
        x4dom_1.x4document.addEventListener('touchend', Component.dispatchCaptures);
        Component.__capture = {
            initiator,
            handler: listener,
            iframes
        };
    }
    static releaseCapture() {
        console.assert(!!Component.__capture);
        x4dom_1.x4document.removeEventListener('touchstart', Component.dispatchCaptures);
        x4dom_1.x4document.removeEventListener('touchmove', Component.dispatchCaptures);
        x4dom_1.x4document.removeEventListener('touchend', Component.dispatchCaptures);
        x4dom_1.x4document.removeEventListener('mousedown', Component.dispatchCaptures);
        x4dom_1.x4document.removeEventListener('mousemove', Component.dispatchCaptures);
        x4dom_1.x4document.removeEventListener('mouseup', Component.dispatchCaptures);
        Component.__capture.iframes.forEach(f => {
            flyWrap(f).setStyleValue('pointer-events', null);
        });
        Component.__capture = null;
        if (Component.__capture_mask) {
            x4dom_1.x4document.body.removeChild(Component.__capture_mask);
            Component.__capture_mask = null;
        }
    }
    /**
     * ensure the component is visible
     * @param: alignToTop
     */
    scrollIntoView(arg) {
        if (this.m_dom) {
            const rel = new tools_1.Rect(this.dom.getBoundingClientRect());
            let top = undefined;
            let bot = undefined;
            let left = undefined;
            let right = undefined;
            let pn = this.dom.parentElement;
            const bdy = x4dom_1.x4document.body;
            while (pn && pn != bdy) {
                const pr = pn.getBoundingClientRect();
                if (top === undefined || top < pr.top) {
                    top = pr.top;
                }
                if (bot === undefined || bot > pr.bottom) {
                    bot = pr.bottom;
                }
                if (left === undefined || left < pr.left) {
                    left = pr.left;
                }
                if (right === undefined || right > pr.right) {
                    right = pr.right;
                }
                pn = pn.parentElement;
            }
            if (top === undefined || rel.top < top || rel.bottom > bot || rel.left < left || rel.right > right) {
                //this.m_dom.scrollIntoView( true );
                this.m_dom.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
            }
            //this.m_dom.scrollIntoView(arg);
        }
    }
    /**
     * search for a given css selector
     * @param selector
     * @returns child or null
     */
    queryItem(selector) {
        let result = this.dom.querySelector(selector);
        return result ? Component.getElement(result) : null;
    }
    queryAll(selector, cb) {
        let elements = Array.from(this.m_dom.querySelectorAll(selector));
        if (cb) {
            elements.forEach((el) => {
                cb(flyWrap(el));
            });
        }
        return elements;
    }
    /**
     * find a child with the given ID
     * @param id id (without '#')
     * @returns child or null
     *
     * @example
     * let btn = this.childWithId<Button>( 'myButtonId' );
     */
    itemWithId(id) {
        let result = this.dom.querySelector('#' + id);
        return result ? Component.getElement(result) : null;
    }
    /**
     * find a child with given ref
     * @param ref
     * @return found child or null
     */
    itemWithRef(ref) {
        let result = null;
        this.enumChilds((c) => {
            if (c.m_props.ref === ref) {
                result = c;
                return true;
            }
        }, true);
        return result;
    }
    /**
     *
     */
    get ref() {
        return this.m_props.ref;
    }
    /**
     *
     */
    static getCss() {
        if (!Component.__css) {
            Component.__css = new styles_1.Stylesheet();
        }
        return Component.__css;
    }
    /**
     * return the parent element
     * care, object must have been created (dom!=null)
     */
    getParent() {
        console.assert(!!this.m_dom);
        let elParent = this.dom.parentNode;
        return Component.getElement(elParent);
    }
    /**
     * get a component from a DOM element
     * move up to the hierarchy to find the request class type.
     * @param dom
     * @param classname
     * @returns
     *
     * @example
     *
     * with a DOM like that:
     * 	 Button
     * 	 	Label
     * 		Icon <- the DOM you have (dom-icon)
     *
     *  let btn = Component.getElement( dom-icon, Button );
     */
    static getElement(dom, classname) {
        if (classname) {
            const srhCls = (0, tools_1.isString)(classname);
            while (dom) {
                let el = dom[_x4_el_sym];
                if (srhCls) {
                    if (el && el.hasClass(classname)) {
                        return el;
                    }
                }
                else if (el instanceof classname) {
                    return el;
                }
                dom = dom.parentElement;
            }
            return null;
        }
        else {
            return dom ? dom[_x4_el_sym] : null;
        }
    }
    /**
     * compute the scrollbar size ( width = height)
     */
    static getScrollbarSize() {
        if (Component.__sb_width === undefined) {
            let outerDiv = x4dom_1.x4document.createElement('div');
            outerDiv.style.cssText = 'overflow:auto;position:absolute;top:0;width:100px;height:100px';
            let innerDiv = x4dom_1.x4document.createElement('div');
            innerDiv.style.width = '200px';
            innerDiv.style.height = '200px';
            outerDiv.appendChild(innerDiv);
            x4dom_1.x4document.body.appendChild(outerDiv);
            Component.__sb_width = outerDiv.offsetWidth - outerDiv.clientWidth;
            x4dom_1.x4document.body.removeChild(outerDiv);
        }
        return Component.__sb_width;
    }
    /**
     * check if the Component is visible to the user
     */
    isUserVisible() {
        if (!this.m_dom) {
            return false;
        }
        return (this.m_dom.offsetParent !== null);
    }
}
exports.Component = Component;
/** @ignore */
let fly_element = null;
/**
 * warp <b>temporarily</b> a DOM element to be able to acces to exact API
 * @param dom dom element to wrap
 * @review qui libere le fly_element ? -> timeout
 */
function flyWrap(dom) {
    if (dom[_x4_el_sym]) {
        return dom[_x4_el_sym];
    }
    let f = fly_element;
    if (!f) {
        f = fly_element = new Component({});
    }
    f.m_dom = dom;
    return f;
}
exports.flyWrap = flyWrap;
/**
 * simple flex spacer
 */
class Flex extends Component {
    constructor(props = {}) {
        if (!props.flex) {
            props.flex = 1;
        }
        super(props);
    }
}
exports.Flex = Flex;
/**
 * simple space between 2 elements
 */
class Space extends Component {
    m_size;
    constructor(size) {
        super({});
        this.m_size = size;
    }
    componentCreated() {
        // try to find if we are in a hz / vt / abs container
        let dom = this.dom;
        let style = null;
        while (dom) {
            let el = dom[_x4_el_sym];
            if (el.hasClass('@hlayout')) {
                style = { width: this.m_size };
                break;
            }
            else if (el.hasClass('@vlayout')) {
                style = { height: this.m_size };
                break;
            }
            dom = dom.parentElement;
        }
        if (!style) {
            style = { width: this.m_size, height: this.m_size };
        }
        this.setStyle(style);
    }
}
exports.Space = Space;
function EvSize(size, mode = null, context = null) {
    return (0, x4events_1.BasicEvent)({ size, mode, context });
}
exports.EvSize = EvSize;
class Separator extends Component {
    m_irect;
    m_delta;
    m_target;
    constructor(props) {
        super(props);
        this.setDomEvent('mousedown', (e) => this._mousedown(e));
        this.setDomEvent('touchstart', (e) => this._mousedown(e));
        this.setDomEvent('dblclick', (e) => this._collapse(e));
    }
    render() {
        this.addClass(this.m_props.orientation);
    }
    _collapse(ev) {
        if (this.m_props.collapsible) {
            this._findTarget();
            if (this.m_target) {
                this.m_target.toggleClass('@collapsed');
            }
        }
    }
    _mousedown(ev) {
        if (ev.type == 'touchstart') {
            let te = ev;
            if (te.touches.length == 1) {
                this._startMoving(te.touches[0].pageX, te.touches[0].pageY, ev);
            }
        }
        else {
            let me = ev;
            this._startMoving(me.pageX, me.pageY, ev);
        }
    }
    _startMoving(x, y, ev) {
        //if( this.m_props.callback ) {
        //	this.m_props.callback( ev, this );
        //}
        //else 
        {
            this._findTarget();
            if (this.m_target) {
                if (this.m_props.orientation == 'horizontal') {
                    if (this.m_props.sizing == 'before') {
                        this.m_delta = x - this.m_irect.right;
                    }
                    else {
                        this.m_delta = x - this.m_irect.left;
                    }
                }
                else {
                    if (this.m_props.sizing == 'before') {
                        this.m_delta = y - this.m_irect.bottom;
                    }
                    else {
                        this.m_delta = y - this.m_irect.top;
                    }
                }
                ev.preventDefault();
                ev.stopPropagation();
                this.m_target.addClass('sizing');
                Component.setCapture(this, (e) => this._pointerMoved(e));
            }
        }
    }
    _pointerMoved(ev) {
        let __move = (ex, ey) => {
            if (this.m_props.orientation == 'horizontal') {
                let width;
                if (this.m_props.sizing == 'after') {
                    width = this.m_irect.right - (ex - this.m_delta);
                }
                else {
                    width = (ex - this.m_delta) - this.m_irect.left;
                }
                if (width > 0) {
                    let size = new tools_1.Size(width, 0);
                    this.emit('resize', EvSize(size));
                    this.m_target.setStyleValue('width', size.width);
                    this.m_target.setStyleValue('flex', null); // for flex>1
                    this.m_target.removeClass('@flex');
                }
            }
            else {
                let height;
                if (this.m_props.sizing == 'after') {
                    height = this.m_irect.bottom - (ey - this.m_delta);
                }
                else {
                    height = (ey - this.m_delta) - this.m_irect.top;
                }
                if (height > 0) {
                    let size = new tools_1.Size(0, height);
                    this.emit('resize', EvSize(size));
                    this.m_target.setStyleValue('height', size.height);
                    this.m_target.setStyleValue('flex', null); // for flex>1
                    this.m_target.removeClass('@flex');
                }
            }
        };
        if (ev.type == 'mousemove') {
            let mev = ev;
            __move(mev.pageX, mev.pageY);
            ev.preventDefault();
            ev.stopPropagation();
        }
        else if (ev.type == 'touchmove') {
            let tev = ev;
            __move(tev.touches[0].pageX, tev.touches[0].pageY);
            ev.preventDefault();
            ev.stopPropagation();
        }
        else if (ev.type == 'mouseup' || ev.type == 'touchend') {
            this.m_target.removeClass('sizing');
            Component.releaseCapture();
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
    _findTarget() {
        if (!this.m_target) {
            if (this.m_props.sizing == 'before') {
                let prevDom = this.dom.previousElementSibling;
                let prevEl = prevDom ? Component.getElement(prevDom) : null;
                this.m_target = prevEl;
            }
            else {
                let nextDom = this.dom.nextElementSibling;
                let nextEl = nextDom ? Component.getElement(nextDom) : null;
                this.m_target = nextEl;
            }
        }
        if (this.m_target) {
            this.m_irect = this.m_target.getBoundingRect();
        }
        else {
            this.m_irect = null;
        }
    }
}
exports.Separator = Separator;
function EvOverlayResize(ui_event, sens, context = null) {
    return (0, x4events_1.BasicEvent)({ ui_event, sens, context });
}
exports.EvOverlayResize = EvOverlayResize;
class SizerOverlay extends Component {
    m_delta;
    m_irect;
    constructor(props) {
        super(props);
        this.addClass(props.sens);
        this.setDomEvent('mousedown', (e) => this._mousedown(e));
        this.setDomEvent('touchstart', (e) => this._mousedown(e));
        this.setDomEvent('dblclick', (e) => this.resetflex(e)); // todo: add option for that
        props.target.appendChild(this);
        if (props.resize) {
            this.on('resize', this.m_props.resize);
        }
    }
    resetflex(event) {
        this.m_props.target.addClass('@flex');
        this.emit('resize', EvSize({ width: -1, height: 0 })); // todo: see that
        event.preventDefault();
        event.stopPropagation();
    }
    // @review move that in component
    _mousedown(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let eev = EvOverlayResize(ev, this.m_props.sens);
        this.emit('rawresize', eev);
        if (eev.defaultPrevented) {
            return;
        }
        let pos = (0, tools_1.getMousePos)(ev, true);
        this.m_irect = this.m_props.target.getBoundingRect();
        if (this.m_props.sens == 'right') {
            this.m_delta = pos.x - this.m_irect.right;
        }
        else if (this.m_props.sens == 'left') {
            this.m_delta = pos.x - this.m_irect.left;
        }
        else if (this.m_props.sens == 'bottom') {
            this.m_delta = pos.y - this.m_irect.bottom;
        }
        else if (this.m_props.sens == 'top') {
            this.m_delta = pos.y - this.m_irect.top;
        }
        this.m_props.target.addClass('sizing');
        Component.setCapture(this, (e) => this._handle_mouse(e));
    }
    _is_horz() {
        return this.m_props.sens == 'left' || this.m_props.sens == 'right';
    }
    get sens() {
        return this.m_props.sens;
    }
    _handle_mouse(ev) {
        let __move = (ex, ey) => {
            if (this._is_horz()) {
                let width;
                if (this.m_props.sens == 'left') {
                    width = this.m_irect.right - (ex - this.m_delta);
                }
                else {
                    width = (ex - this.m_delta) - this.m_irect.left;
                }
                if (width > 0) {
                    let size = {
                        width,
                        height: undefined
                    };
                    this.emit('resize', EvSize(size));
                    this.m_props.target.setStyleValue('width', size.width);
                    this.m_props.target.setStyleValue('flex', null); // for flex>1
                    this.m_props.target.removeClass('@flex');
                }
            }
            else {
                let height;
                if (this.m_props.sens == 'top') {
                    height = this.m_irect.bottom - (ey - this.m_delta);
                }
                else {
                    height = (ey - this.m_delta) - this.m_irect.top;
                }
                if (height > 0) {
                    let size = new tools_1.Size(0, height);
                    this.emit('resize', EvSize(size));
                    this.m_props.target.setStyleValue('height', size.height);
                    this.m_props.target.setStyleValue('flex', null); // for flex>1
                    this.m_props.target.removeClass('@flex');
                }
            }
        };
        if (ev.type == 'mousemove') {
            let mev = ev;
            __move(mev.pageX, mev.pageY);
            ev.preventDefault();
            ev.stopPropagation();
        }
        else if (ev.type == 'touchmove') {
            let tev = ev;
            __move(tev.touches[0].pageX, tev.touches[0].pageY);
            ev.preventDefault();
            ev.stopPropagation();
        }
        else if (ev.type == 'mouseup' || ev.type == 'touchend') {
            this.m_props.target.removeClass('sizing');
            Component.releaseCapture();
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
}
exports.SizerOverlay = SizerOverlay;
function EvShortcut(name) {
    return (0, x4events_1.BasicEvent)({ name });
}
/**
 * you can construct a Container as usual with it's properties but also directly with it's children array
 *
 * @example
 * new Container( [
 * 	child1,
 *  child2
 * ])
 */
class Container extends Component {
    m_shortcuts;
    constructor(props) {
        if ((0, tools_1.isArray)(props)) {
            super({ content: props });
        }
        else {
            super(props);
        }
    }
    /**
     * add an application shortcut
     * @param sequence key sequence Shift+Ctrl+Alt+K
     * @param callback callback to call
     */
    addShortcut(sequence, name, callback = null, immediate = false) {
        // first time
        if (!this.m_shortcuts) {
            this.m_shortcuts = [];
            this.setDomEvent('keydown', (e) => this._handleKeydown(e));
        }
        if (!(0, tools_1.isArray)(sequence)) {
            sequence = [sequence];
        }
        sequence.forEach((seq) => {
            let reseq = '';
            let shift = seq.match(/SHIFT/i);
            if (shift) {
                seq = seq.replace(/SHIFT/i, '');
                reseq += 'shift+';
            }
            let ctrl = seq.match(/CTRL/i);
            if (ctrl) {
                seq = seq.replace(/CTRL/i, '');
                reseq += 'ctrl+';
            }
            let cmd = seq.match(/CMD/i);
            if (cmd) {
                seq = seq.replace(/CMD/i, '');
                reseq += 'cmd+';
            }
            let alt = seq.match(/ALT/i);
            if (alt) {
                seq = seq.replace(/ALT/i, '');
                reseq += 'alt+';
            }
            reseq += seq.replace('+', '').toLowerCase();
            this.m_shortcuts.push({
                sequence: reseq,
                name,
                immediate,
                callback
            });
        });
    }
    /**
     * remove all shortcuts for a target
     */
    removeShortcuts() {
        if (this.m_shortcuts) {
            this.m_shortcuts = [];
        }
    }
    /** @ignore this function is binded */
    _handleKeydown(e) {
        if (!this.m_shortcuts) {
            return;
        }
        let seq = '';
        if (e.shiftKey) {
            seq += 'shift+';
        }
        if (e.ctrlKey) {
            seq += 'ctrl+';
        }
        if (e.metaKey) {
            seq += 'cmd+';
        }
        if (e.altKey) {
            seq += 'alt+';
        }
        seq += e.key.toLowerCase();
        //console.log( seq );
        this.m_shortcuts.some((sk) => {
            if (sk.sequence == seq) {
                if (sk.callback) {
                    if (sk.immediate) {
                        sk.callback(e);
                    }
                    else {
                        (0, tools_1.asap)(() => { sk.callback(e); });
                    }
                }
                else {
                    this.emit('shortcut', EvShortcut(sk.name));
                }
                e.preventDefault();
                e.stopPropagation();
                return true;
            }
        });
    }
}
exports.Container = Container;
