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


/**
 * @todo 
 *		create Container class
 */

import { pascalCase, Rect, isString, isArray, Size, Point, isNumber, asap, HtmlString, isHtmlString, Constructor, getMousePos } from './tools';
import { Stylesheet, ComputedStyle } from './styles';
import { _tr } from './i18n';
import { BasicEvent, EventCallback } from './x4_events';
import { BaseComponent, BaseComponentProps, BaseComponentEventMap } from './base_component';
import { IDOMEvents, X4ElementEventMap } from './dom_events';

export { HtmlString, isHtmlString, html } from './tools'

export interface EventHandler<T> {
	(ev: T): any;
}

export interface ICaptureInfo {
	initiator: Component;
	handler: EventHandler<UIEvent>;
	iframes: NodeListOf<HTMLIFrameElement>;
}

/** @ignore classname prefix for system classes */
const _x4_ns_prefix = 'x-';

// -- elements -----------

/** @ignore where event handlers are stored */
const _x4_el_store = Symbol();

/** @ignore where Component is stored in dom */
const _x4_el_sym = Symbol();

/** @ignore properties without 'px' unit */
const _x4_unitless = {
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


/**
 * 
 */

export type VoidCallback = () => void;

export type ComponentOrString = Component | string | HtmlString;
export type ComponentContent = ComponentOrString | ComponentOrString[];

interface IMap<T> {
	[key: string]: T;
}

/**
 * DblClick Event
 * double click event 
 */

export interface EvDblClick extends BasicEvent {
}

export function EvDblClick(context = null) {
	return BasicEvent<EvDblClick>({ context });
}

/**
 * DblFocus Event
 * double click event 
 */

export interface EvFocus extends BasicEvent {
	readonly focus: boolean;
}

export function EvFocus( focus = true, context = null) {
	return BasicEvent<EvFocus>({ focus, context });
}

/**
 * basic event map of Component
 */

export interface CEventMap extends BaseComponentEventMap {
}




/**
 * Basic properties of every Component
 */

export interface CProps<T extends CEventMap = CEventMap> extends BaseComponentProps<T> {
	tag?: string;			// dom Tag <div> if not specified
	ns?: string;			// namespace (usefull for svg)
	cls?: string;			// elements classes (space separated), prefix class name with @ to make it system wide
	id?: string;			// element id
	style?: IMap<string | number>;	// element style
	attrs?: object;			// element attributes

	dom_events?: IDOMEvents;	// DOM event handlers
	data?: any;				// element user data (you can store everything you need here)
	content?: ComponentContent;	// array of sub components
	tooltip?: string;		// tooltip text
	ref?: string;			// internal reference for itemWithRef

	// shortcuts for element style
	left?: number;
	top?: number;
	width?: number | string;
	height?: number | string;
	tabIndex?: number | boolean;

	flex?: number | string;	// add @flex class to the element
	enabled?: boolean;		// add @disabled to the element if false
}

interface CInternalProps {
	dom_events: any;
	classes: IMap<boolean>;
	uid: number;
	inrender: boolean;
}

/**
 * 
 */

export class Component<P extends CProps<BaseComponentEventMap> = CProps<BaseComponentEventMap>, E extends BaseComponentEventMap = BaseComponentEventMap> extends BaseComponent<P, E> {
	private m_dom: HTMLElement;
	private m_iprops: CInternalProps;

	private static __sb_width;			// scrollbar width
	private static __comp_guid = 1000;	// component global unique id
	private static __privateEvents: any = {};
	private static __sizeObserver: ResizeObserver;	// resize observer
	private static __createObserver: MutationObserver;	// creation observer
	private static __intersectionObserver: IntersectionObserver;	// visibility observer

	private static __capture: ICaptureInfo = null;
	private static __capture_mask = null;
	private static __css = null;

	constructor(props: P = null ) {
		super(props ?? {} as P );

		this.m_iprops = {
			classes: {},
			dom_events: {},
			uid: Component.__comp_guid++,
			inrender: false,
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

	setContent(content: ComponentContent, refreshAll = false ) {
		this.m_props.content = content ?? [];

		if( this.m_iprops.inrender || !this.m_dom ) {
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

	appendChild(content: ComponentContent) {

		if (!content) {
			return;
		}

		const append = (c) => {

			if (!this.m_props.content) {
				this.m_props.content = [];
			}
			else if (!isArray(this.m_props.content)) {
				this.m_props.content = [this.m_props.content];
			}

			this.m_props.content.push(c);
			if (this.m_dom) {
				this._appendChild(c);
			}
		}

		if (isArray(content)) {
			content.forEach(append);
		}
		else {
			append(content);
		}
	}

	/**
	 * get the Component value
	 * @param name name to get
	 */

	getProp(name: string): any {
		return this.m_props[name];
	}

	/**
	 * change a Component value
	 * @param name name to set
	 * @param value new value
	 */

	setProp(name: string, value?: any) {
		this.m_props[name] = value;
	}

	/**
	 * get the Component data value
	 * @param name name to get
	 */

	getData(name: string | Symbol): any {
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

	setData(name: string | Symbol , value: any) {

		let data = this.m_props.data;
		if (data === undefined) {
			data = this.m_props.data = {};
		}

		data[name.toString()] = value;
	}


	/**
	 * return the DOM associated with the Component (if any)
	 */

	get dom(): HTMLElement {
		return this.m_dom;
	}

	/**
	 * shows the element
	 * @param show
	 */

	show(show?: boolean) {
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

	enable(enable?: boolean) {
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

	public setStyle(style: object) {
		for (let s in style) {
			this.setStyleValue(s, style[s]);
		}
	}

	/**
	 * change a style value
	 * @param name string style nale
	 * @param value any style value or null to remove style
	 */

	setStyleValue(name: string, value: any) {
		let style = this.m_props.style;
		if (!style) {
			style = this.m_props.style = {};
		}

		style[name] = value;
		this._setDomStyleValue(name, value);
	}

	private _setDomStyleValue(name: string, value: string | number) {
		if (this.m_dom) {

			if (value === undefined) {
				value = null;
			}
			else if (!_x4_unitless[name] && (isNumber(value) || reNumber.test(value))) {
				value = value + 'px';
			}

			this.m_dom.style[name] = value;
		}
	}

	/**
	 * compute the element style 
	 * @return all styles computed
	 */

	public getComputedStyle(pseudoElt?: string): ComputedStyle {
		if (this.dom) {
			return new ComputedStyle(getComputedStyle(this.dom, pseudoElt ?? null));
		}

		return new ComputedStyle(this.m_props.style as any);
	}

	/**
	 * return a single stype value
	 * @param name - value to get
	 */

	public getStyleValue(name: string) {
		return this.getComputedStyle()[name];
	}

	/**
	 * define the elements attributes
	 * @param attrs 
	 */

	public setAttributes(attrs: any) {
		for (let a in attrs) {
			this.setAttribute(a, attrs[a]);
		}
	}

	/**
	 * change a single attribute
	 * @param name attribute name
	 * @param value new value 
	 */

	public setAttribute(name: string, value: any) {

		if (value === false || value === undefined) {
			this.removeAttribute(name);
		}
		else {
			if (value === true) {
				value = '';
			}
			else if (isNumber(value)) {
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

	private _setDomAttribute(name: string, value: string) {
		if (this.m_dom) {
			this.m_dom.setAttribute(name, value);
		}
	}

	/**
	 * remove an atrribute
	 * @param name name of the attribute
	 */
	public removeAttribute(name: string) {
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

	public getAttribute(name: string): string {
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

	public hasAttribute(name: string): boolean {
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

	public addClass(name: string) {

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
		}

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

	public removeClass(name: string): void {

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
		}

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

	public setClass(cls: string, set: boolean) {
		if (set) { this.addClass(cls); }
		else { this.removeClass(cls); }
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

	public toggleClass(name: string): void {

		let toggle = (c) => {
			if (c === undefined && c === null && c === '') {
				return;
			}

			c = this._makeCls(c);
			if (this.m_iprops.classes[c]) {
				delete this.m_iprops.classes[c]
			}
			else {
				this.m_iprops.classes[c] = true;
			}

			if (this.m_dom) {
				this.m_dom.classList.toggle(c);
			}
		}

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

	public hasClass(cls: string): boolean {

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

	public clearClasses() {
		this.m_iprops.classes = {};
		if (this.m_dom) {
			return this.m_dom.classList.value = '';
		}
	}

	///@deprecated
	//private build(): void  {}
	/**
	 * @deprecated
	 */
	
	private Build(): void { }

	public _build(): HTMLElement {
		if (this.m_dom) {
			return this.m_dom;
		}

		this._createDOM();

		return this.m_dom;
	}

	public render(props: P) {
		if( this.m_props.tag=='footer') {
			debugger;
		}
	}

	public _createDOM(): HTMLElement {

		if (this.m_dom) {
			return this.m_dom;
		}

		// setup props
		const props = this.m_props;

		if( props.tabIndex!==undefined ) {
			this._setTabIndex( props.tabIndex );
		}
		this.render(props);
		
		// shortcuts ---------
		if (props.left !== undefined) { this.setStyleValue('left', props.left); }
		if (props.top !== undefined) { this.setStyleValue('top', props.top); }
		if (props.width !== undefined) { this.setStyleValue('width', props.width); }
		if (props.height !== undefined) { this.setStyleValue('height', props.height); }

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
		this.m_props.cls = undefined;	// now classes are tranfered to m_iprops

		// create self
		let vdom = this.m_iprops;

		if (props.ns) {
			this.m_dom = <HTMLElement>document.createElementNS(props.ns, props.tag ?? 'div');
		}
		else {
			this.m_dom = document.createElement(props.tag ?? 'div');
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
				if( attr!==false && attr!==undefined ) {
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

			if (!isArray(content)) {
				content = [content];
			}

			content.forEach((el) => {
				if (!el) {
					return;
				}

				if (isString(el)) {
					this.m_dom.insertAdjacentText('beforeend', el);
				}
				else if (isHtmlString(el)) {
					this.m_dom.insertAdjacentHTML('beforeend', el as string);
				}
				else if (el instanceof Component) {
					this.m_dom.append(el._build());
				}
				else {
					console.log( 'unknown element type: ', el );
				}
			});
		}

		// wait for dom insertion inside document.body
		if (!Component.__createObserver) {
			Component.__createObserver = new MutationObserver(Component._observeCreation);
			Component.__createObserver.observe(document.body, { childList: true, subtree: true });
		}

		return this.m_dom;
	}

	protected _setTabIndex(tabIndex: number | boolean, defValue = 0) {

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

	private static _observeCreation(mutations: MutationRecord[]) {

		// notify descendants that we have been created (dom exists)

		for (let mutation of mutations) {

			if (mutation.type == 'childList') {

				for (let i = 0, n = mutation.addedNodes.length; i < n; i++) {

					let add = mutation.addedNodes[i] as HTMLElement;
					let el = add[_x4_el_sym] as Component;

					if (el) {
						el.enumChilds((c: Component) => {

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

	public dispose() {
		if (this.m_dom) {
			this._dispose(true,true);
		}
	}

	protected _dispose(with_dom: boolean, timers: boolean ) {

		let _dom = this.m_dom;

		// free attached resources
		delete _dom[_x4_el_sym];
		delete _dom[_x4_el_store];

		//
		if (with_dom) {
			_dom.remove();
		}

		// notify every child that they will be removed
		this.enumChilds((c: Component) => {
			c._dispose(false,true);
		});

		this.m_dom = null;

		if( timers ) {
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

	public update(delay = 0) {

		if (this.m_dom) {

			const _update = () => {
				let oldDOM = this.m_dom;
				this._dispose(false,false);

				let newDOM = this._build();
				console.assert( !!oldDOM.parentNode, 'update in componentCreated is not allowed, use updateContent' );

				oldDOM.parentNode.replaceChild(newDOM, oldDOM);
			}

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
	public _empty( ) {
		//this.m_dom.innerHTML = '';
		
		const el = this.m_dom;
		if( !el ) {
			return;
		}

		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	}

	public _updateContent() {

		if (!this.m_dom) {
			return;
		}

		this._empty( );

		let content = this.m_props.content;

		// create children
		if (content) {

			if (!isArray(content)) {
				content = [content];
			}

			content.forEach((el) => {
				if (!el) {
					return;
				}

				if (isHtmlString(el)) {
					this.m_dom.insertAdjacentHTML('beforeend', el as string);
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

	public getBoundingRect(withMargins = false): Rect {
		console.assert(this.dom != null, 'cannot get bounding rect of an non DOM element');
		let r = this.dom.getBoundingClientRect();

		let rc = new Rect(r.left, r.top, r.width, r.height);

		if (withMargins) {

			let st = this.getComputedStyle();

			let tm = st.parse('marginTop'),
				bm = st.parse('marginBottom'),
				lm = st.parse('marginLeft'),
				rm = st.parse('marginRight');

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

	public setDomEvent<K extends keyof X4ElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: X4ElementEventMap[K]) => void) {
		let _listener = listener as EventListener;
		this._setDomEvent(type as string, _listener);
	}

	private _setDomEvent(type: string, listener: EventListener) {

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

	public clearDomEvent<K extends keyof X4ElementEventMap>(type: K) {
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

	public mapPropEvents<N extends keyof E>(props: P, ...elements: N[] ) {
		elements.forEach( name => {
			const n = name as string;
			if (props[n]) {
				this._on(n, props[n]);
			}
		})
	}

	/**
	 * 
	 * @param name 
	 * @param handler 
	 */

	public createEvent(name: string, handler: Function) {

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
				document.addEventListener(name, Component._dispatchEvent, { passive: false, capture: true });
			}
			else {
				document.addEventListener(name, Component._dispatchEvent, true);
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

	private static _dispatchEvent(ev: any) {

		let target = ev.target,
			noup = unbubbleEvents[ev.type] === 2;

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

	private static _dispatchUnbubbleEvent(ev: any) {

		let target = ev.currentTarget || ev.target,
			eventType = ev.type;

		let eventStore = target[_x4_el_store],
			store = eventStore && eventStore[eventType];

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

	private static _observeSize(entries: ResizeObserverEntry[]) {

		entries.forEach((entry) => {
			let dom = entry.target as HTMLElement;
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

	enumChilds(cb: (child: Component) => boolean | void, recursive = false): boolean {

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

			if (!isArray(content)) {
				content = [content];
			}

			content.some((el) => {
				if (!el || isString(el) || isHtmlString(el)) {
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

	private _appendChild(el: ComponentOrString) {

		if (isString(el)) {
			this.m_dom.insertAdjacentText('beforeend', el);
		}
		else if (isHtmlString(el)) {
			this.m_dom.insertAdjacentHTML('beforeend', el as string);
		}
		else {
			let component: Component = el;

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

	private _genClassName() {

		this.addClass('@comp');

		let me = Object.getPrototypeOf(this);
		while (me && me.constructor !== Component) {
			let clsname = me.constructor.name;
			this.addClass('@' + pascalCase(clsname));

			me = Object.getPrototypeOf(me);
		}

		this.addClass(this.m_props.cls);
	}

	/**
	 * prepend the system class name prefix on a name if needed (if class starts with @)
	 */

	private _makeCls(cls: string): string {
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

	private static dispatchCaptures(event: UIEvent) {
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

	protected static setCapture(initiator: Component, listener: EventHandler<UIEvent>) {

		console.assert(!Component.__capture);
		if (Component.__capture) {
			debugger;
		}

		//	todo: review that

		let iframes = document.querySelectorAll("iframe");
		iframes.forEach( f => {
			flyWrap(f).setStyleValue( 'pointer-events', 'none' );
		});

		let overs = document.querySelectorAll(":hover");

		let cursor = null;
		if (overs.length) {
			let elementOver = <HTMLElement>overs[overs.length - 1];
			let style = window.getComputedStyle(elementOver);
			cursor = style.cursor;
		}

		Component.__capture_mask = document.createElement('div');
		let mask = flyWrap(Component.__capture_mask);
		mask.addClass('@capture-mask');

		if (cursor) {
			mask.setStyleValue('cursor', cursor);
		}

		document.body.appendChild(mask.dom);

		document.addEventListener('mousedown', Component.dispatchCaptures);
		document.addEventListener('mousemove', Component.dispatchCaptures);
		document.addEventListener('mouseup', Component.dispatchCaptures);

		document.addEventListener('touchstart', Component.dispatchCaptures);
		document.addEventListener('touchmove', Component.dispatchCaptures);
		document.addEventListener('touchend', Component.dispatchCaptures);

		Component.__capture = {
			initiator,
			handler: listener,
			iframes
		};
	}

	protected static releaseCapture() {

		console.assert(!!Component.__capture);

		document.removeEventListener('touchstart', Component.dispatchCaptures);
		document.removeEventListener('touchmove', Component.dispatchCaptures);
		document.removeEventListener('touchend', Component.dispatchCaptures);

		document.removeEventListener('mousedown', Component.dispatchCaptures);
		document.removeEventListener('mousemove', Component.dispatchCaptures);
		document.removeEventListener('mouseup', Component.dispatchCaptures);
		
		Component.__capture.iframes.forEach( f => {
			flyWrap(f).setStyleValue( 'pointer-events', null );
		})

		Component.__capture = null;
		if (Component.__capture_mask) {
			document.body.removeChild(Component.__capture_mask);
			Component.__capture_mask = null;
		}
	}

	/**
	 * ensure the component is visible
	 * @param: alignToTop 
	 */

	public scrollIntoView(arg?: boolean | ScrollIntoViewOptions) {
		if (this.m_dom) {

			const rel = new Rect( this.dom.getBoundingClientRect( ) );
			
			let top = undefined;
			let bot = undefined;
			let left = undefined;
			let right = undefined;

			let pn = this.dom.parentElement;
			while( pn && pn!=document.body ) {

				const pr = pn.getBoundingClientRect( );

				if( top===undefined || top<pr.top ) {
					top = pr.top;
				}

				if( bot===undefined || bot>pr.bottom ) {
					bot = pr.bottom;
				}

				if( left===undefined || left<pr.left ) {
					left = pr.left;
				}

				if( right===undefined || right>pr.right ) {
					right = pr.right;
				}

				pn = pn.parentElement;
			}

			if( top===undefined || rel.top<top || rel.bottom>bot || rel.left<left || rel.right>right ) {
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

	public queryItem<T extends Component>(selector: string): T {
		let result = <HTMLElement>this.dom.querySelector(selector);
		return result ? Component.getElement<T>(result) : null;
	}

	public queryAll(selector: string, cb?: (el: Component) => void) {
		const elements = this.m_dom.querySelectorAll(selector);
		if( cb ) {
			elements.forEach((el) => {
				cb(flyWrap(el as HTMLElement));
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
	public itemWithId<T extends Component>(id: string): T {
		let result = <HTMLElement>this.dom.querySelector('#' + id);
		return result ? Component.getElement<T>(result) : null;
	}

	/**
	 * find a child with given ref
	 * @param ref 
	 * @return found child or null
	 */

	public itemWithRef<T = Component>(ref: string): T {

		let result = null;
		this.enumChilds((c: Component) => {
			if (c.m_props.ref === ref) {
				result = c;
				return true;
			}
		}, true);

		return result as T;
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

	static getCss(): Stylesheet {
		if (!Component.__css) {
			Component.__css = new Stylesheet();
		}

		return Component.__css;
	}

	/**
	 * return the parent element
	 * care, object must have been created (dom!=null)
	 */

	public getParent(): Component {
		console.assert(!!this.m_dom);

		let elParent = this.dom.parentNode;
		return Component.getElement(<HTMLElement>elParent);
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

	static getElement<T extends Component>(dom: HTMLElement | Element, classname?: Constructor<T> | string ): T {

		if (classname) {

			const srhCls = isString(classname);

			while (dom) {
				let el: Component = dom[_x4_el_sym];

				if( srhCls ) {
					if( el && el.hasClass(classname) ) {
						return el as T;
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
			let outerDiv = document.createElement('div');
			outerDiv.style.cssText = 'overflow:auto;position:absolute;top:0;width:100px;height:100px';

			let innerDiv = document.createElement('div');
			innerDiv.style.width = '200px';
			innerDiv.style.height = '200px';

			outerDiv.appendChild(innerDiv);
			document.body.appendChild(outerDiv);

			Component.__sb_width = outerDiv.offsetWidth - outerDiv.clientWidth;
			document.body.removeChild(outerDiv);
		}

		return Component.__sb_width;
	}

	/**
	 * check if the Component is visible to the user
	 */

	isUserVisible(): boolean {
		if (!this.m_dom) {
			return false;
		}

		return (this.m_dom.offsetParent !== null);
	}
}

/** @ignore */
let fly_element: Component = null;

/**
 * warp <b>temporarily</b> a DOM element to be able to acces to exact API
 * @param dom dom element to wrap
 * @review qui libere le fly_element ? -> timeout
 */

export function flyWrap<T extends Component>(dom: HTMLElement | EventTarget): T {

	if (dom[_x4_el_sym]) {
		return dom[_x4_el_sym];
	}

	let f = fly_element;
	if (!f) { f = fly_element = new Component({}); }
	(<any>f).m_dom = dom;

	return f as T;
}








/**
 * simple flex spacer
 */

export class Flex extends Component {

	constructor(props: CProps = {}) {
		if (!props.flex) {
			props.flex = 1;
		}

		super(props);
	}
}

/**
 * simple space between 2 elements
 */

export class Space extends Component {

	m_size: number | string;

	constructor(size: number | string) {
		super({});

		this.m_size = size;
	}

	componentCreated() {

		// try to find if we are in a hz / vt / abs container
		let dom = this.dom;
		let style = null;

		while (dom) {
			let el: Component = dom[_x4_el_sym];
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

/**
 * sizable separator
 */

type SizeMode = null | 'minimize' | 'maximize' | 'restore';

export interface EvSize extends BasicEvent {
	readonly size: Size;
	readonly mode: SizeMode;
}

export function EvSize(size: Size, mode: SizeMode = null, context = null ): EvSize {
	return BasicEvent<EvSize>({ size, mode, context });
}

interface SeparatorEventMap extends CEventMap {
	resize?: EvSize;
}

interface SeparatorProps extends CProps<SeparatorEventMap> {
	readonly orientation: 'vertical' | 'horizontal';		// vertical means vertical sizer so it resize horizontally
	readonly sizing: 'before' | 'after';
	readonly collapsible?: boolean;
}

export class Separator extends Component<SeparatorProps, SeparatorEventMap> {

	m_irect: Rect;
	m_delta: number;
	m_target: Component;

	constructor(props: SeparatorProps) {
		super(props);

		this.setDomEvent('mousedown', (e) => this._mousedown(e));
		this.setDomEvent('touchstart', (e) => this._mousedown(e));
		this.setDomEvent('dblclick', (e) => this._collapse(e) );
	}

	render() {
		this.addClass(this.m_props.orientation);
	}

	private _collapse( ev: UIEvent ) {
		if( this.m_props.collapsible ) {
			this._findTarget();
			if( this.m_target ) {
				this.m_target.toggleClass( '@collapsed' );
			}
		}
	}

	private _mousedown(ev: UIEvent) {

		if (ev.type == 'touchstart') {
			let te = ev as TouchEvent;
			if (te.touches.length == 1) {
				this._startMoving(te.touches[0].pageX, te.touches[0].pageY, ev);
			}
		}
		else {
			let me = ev as MouseEvent;
			this._startMoving(me.pageX, me.pageY, ev);
		}
	}

	_startMoving(x: number, y: number, ev: UIEvent) {
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

	private _pointerMoved(ev: UIEvent) {

		let __move = (ex, ey) => {

			if (this.m_props.orientation == 'horizontal') {

				let width;
				if (this.m_props.sizing == 'after') {
					width = this.m_irect.right - (ex - this.m_delta);
				}
				else {
					width = (ex - this.m_delta) - this.m_irect.left
				}

				if (width > 0) {
					let size = new Size(width, 0);
					this.emit('resize', EvSize(size));

					this.m_target.setStyleValue('width', size.width);
					this.m_target.setStyleValue('flex', null);	// for flex>1
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
					let size = new Size(0, height);
					this.emit('resize', EvSize(size));

					this.m_target.setStyleValue('height', size.height);
					this.m_target.setStyleValue('flex', null);	// for flex>1
					this.m_target.removeClass('@flex');
				}
			}
		}

		if (ev.type == 'mousemove') {

			let mev = ev as MouseEvent;
			__move(mev.pageX, mev.pageY);

			ev.preventDefault();
			ev.stopPropagation();
		}
		else if (ev.type == 'touchmove') {

			let tev = ev as TouchEvent;
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

	private _findTarget() {

		if (!this.m_target) {

			if (this.m_props.sizing == 'before') {
				let prevDom = this.dom.previousElementSibling;
				let prevEl = prevDom ? Component.getElement(prevDom as HTMLElement) : null;
				this.m_target = prevEl;
			}
			else {
				let nextDom = this.dom.nextElementSibling;
				let nextEl = nextDom ? Component.getElement(nextDom as HTMLElement) : null;
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




// :: SIZERBAR ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/**
 * properties
 */

type SizerOverlaySens = 'left' | 'top' | 'right' | 'bottom' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';

export interface EvOverlayResize extends BasicEvent {
	ui_event: UIEvent;
	sens: SizerOverlaySens;
}

export function EvOverlayResize(ui_event: UIEvent, sens: SizerOverlaySens, context: any = null) {
	return BasicEvent<EvOverlayResize>({ ui_event, sens, context });
}

interface SizerOverlayEventMap extends CEventMap {
	resize: EvSize;
	rawresize: EvOverlayResize;
}


export interface SizerOverlayProps extends CProps<SizerOverlayEventMap> {
	sens: SizerOverlaySens;
	target: Component;

	resize?: EventCallback<EvSize>;	// shortcut to events: { size: ... }
}

export class SizerOverlay extends Component<SizerOverlayProps, SizerOverlayEventMap> {

	private m_delta: number;
	private m_irect: Rect;

	constructor(props: SizerOverlayProps) {
		super(props);

		this.addClass(props.sens);
		this.setDomEvent('mousedown', (e) => this._mousedown(e));
		this.setDomEvent('touchstart', (e) => this._mousedown(e));
		this.setDomEvent('dblclick', (e) => this.resetflex(e));	// todo: add option for that

		props.target.appendChild(this);

		if( props.resize ) {
			this.on( 'resize', this.m_props.resize );
		}
	}

	resetflex(event: UIEvent) {
		this.m_props.target.addClass('@flex');
		this.emit('resize', EvSize( { width: -1, height: 0}));	// todo: see that
		event.preventDefault();
		event.stopPropagation();
	}

	// @review move that in component

	_mousedown(ev: UIEvent) {

		ev.preventDefault();
		ev.stopPropagation();
		
		let eev = EvOverlayResize(ev, this.m_props.sens);
		this.emit('rawresize', eev);
		if (eev.defaultPrevented) {
			return;
		}

		let pos = getMousePos(ev, true);
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

	private _is_horz() {
		return this.m_props.sens == 'left' || this.m_props.sens == 'right';
	}

	public get sens() {
		return this.m_props.sens;
	}

	private _handle_mouse(ev: UIEvent) {
		let __move = (ex, ey) => {
			if (this._is_horz()) {

				let width;
				if (this.m_props.sens == 'left') {
					width = this.m_irect.right - (ex - this.m_delta);
				}
				else {
					width = (ex - this.m_delta) - this.m_irect.left
				}

				if (width > 0) {
					let size = {
						width,
						height: undefined
					};

					this.emit('resize', EvSize(size));

					this.m_props.target.setStyleValue('width', size.width);
					this.m_props.target.setStyleValue('flex', null);	// for flex>1
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
					let size = new Size(0, height);
					this.emit('resize', EvSize(size));

					this.m_props.target.setStyleValue('height', size.height);
					this.m_props.target.setStyleValue('flex', null);	// for flex>1
					this.m_props.target.removeClass('@flex');
				}
			}
		}

		if (ev.type == 'mousemove') {

			let mev = ev as MouseEvent;
			__move(mev.pageX, mev.pageY);

			ev.preventDefault();
			ev.stopPropagation();
		}
		else if (ev.type == 'touchmove') {

			let tev = ev as TouchEvent;
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

/**
 * sequence: Shift+Ctrl+Alt+A
 */

export interface Shortcut {
	sequence: string;
	name: string;
	immediate: boolean;
	callback?: (domTarget) => void;
}

interface EvShortcut extends BasicEvent {
	name: string;
}

function EvShortcut(name: string) {
	return BasicEvent<EvShortcut>({ name });
}

export interface ContainerEventMap extends CEventMap {
	shortcut: EvShortcut;
}

export interface ContainerProps<E extends ContainerEventMap = ContainerEventMap> extends CProps<E> {
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

export class Container<P extends ContainerProps = ContainerProps, E extends ContainerEventMap = ContainerEventMap> extends Component<P, E> {

	private m_shortcuts: Shortcut[];

	constructor( props: P | ComponentOrString[] ) {
		if( isArray(props) ) {
			super( {content: props} as P );
		}
		else {
			super( props );
		}
	}
	
	/**
	 * add an application shortcut
	 * @param sequence key sequence Shift+Ctrl+Alt+K
	 * @param callback callback to call
	 */

	public addShortcut(sequence: string | string[], name: string, callback: EventHandler<KeyboardEvent> = null, immediate = false) {

		// first time
		if (!this.m_shortcuts) {
			this.m_shortcuts = [];
			this.setDomEvent('keydown', (e) => this._handleKeydown(e));
		}

		if (!isArray(sequence)) {
			sequence = [sequence];
		}

		sequence.forEach((seq: string) => {
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
	private _handleKeydown(e: KeyboardEvent) {

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
						asap(() => { sk.callback(e); });
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

export type ComponentConstructor<T> = new (props: CProps) => T;