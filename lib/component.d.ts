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
import { Rect, Size, HtmlString, Constructor } from './tools';
import { Stylesheet, ComputedStyle } from './styles';
import { BasicEvent, EventCallback } from './x4_events';
import { BaseComponent, BaseComponentProps, BaseComponentEventMap } from './base_component';
import { IDOMEvents, X4ElementEventMap } from './dom_events';
export { HtmlString, isHtmlString, html } from './tools';
export interface EventHandler<T> {
    (ev: T): any;
}
export interface ICaptureInfo {
    initiator: Component;
    handler: EventHandler<UIEvent>;
    iframes: NodeListOf<HTMLIFrameElement>;
}
/**
 *
 */
export declare type VoidCallback = () => void;
export declare type ComponentOrString = Component | string | HtmlString;
export declare type ComponentContent = ComponentOrString | ComponentOrString[];
interface IMap<T> {
    [key: string]: T;
}
/**
 * DblClick Event
 * double click event
 */
export interface EvDblClick extends BasicEvent {
}
export declare function EvDblClick(context?: any): EvDblClick;
/**
 * DblFocus Event
 * double click event
 */
export interface EvFocus extends BasicEvent {
    readonly focus: boolean;
}
export declare function EvFocus(focus?: boolean, context?: any): EvFocus;
/**
 * basic event map of Component
 */
export interface CEventMap extends BaseComponentEventMap {
}
/**
 * Basic properties of every Component
 */
export interface CProps<T extends CEventMap = CEventMap> extends BaseComponentProps<T> {
    tag?: string;
    ns?: string;
    cls?: string;
    id?: string;
    style?: IMap<string | number>;
    attrs?: object;
    dom_events?: IDOMEvents;
    data?: any;
    content?: ComponentContent;
    tooltip?: string;
    ref?: string;
    left?: number;
    top?: number;
    width?: number | string;
    height?: number | string;
    tabIndex?: number | boolean;
    flex?: number | string;
    enabled?: boolean;
}
/**
 *
 */
export declare class Component<P extends CProps<BaseComponentEventMap> = CProps<BaseComponentEventMap>, E extends BaseComponentEventMap = BaseComponentEventMap> extends BaseComponent<P, E> {
    private m_dom;
    private m_iprops;
    private static __sb_width;
    private static __comp_guid;
    private static __privateEvents;
    private static __sizeObserver;
    private static __createObserver;
    private static __capture;
    private static __capture_mask;
    private static __css;
    constructor(props?: P);
    /**
     *
     */
    get uid(): number;
    /**
     * change the component content
     * @param content new content or null
     */
    setContent(content: ComponentContent, refreshAll?: boolean): void;
    /**
     * add a new child to the component content
     * @param content
     */
    appendChild(content: ComponentContent): void;
    /**
     * get the Component value
     * @param name name to get
     */
    getProp(name: string): any;
    /**
     * change a Component value
     * @param name name to set
     * @param value new value
     */
    setProp(name: string, value?: any): void;
    /**
     * get the Component data value
     * @param name name to get
     */
    getData(name: string | Symbol): any;
    /**
     * set the Component data value
     * @param name name to get
     * @param value
     */
    setData(name: string | Symbol, value: any): void;
    /**
     * return the DOM associated with the Component (if any)
     */
    get dom(): HTMLElement;
    /**
     * shows the element
     * @param show
     */
    show(show?: boolean): void;
    /**
     * hides the element
     */
    hide(): void;
    /**
     * enable or disable the element
     * @param enable
     */
    enable(enable?: boolean): void;
    /**
     * disable the element
     */
    disable(): void;
    /**
     * set the focus on the element
     */
    focus(): void;
    /**
     * change the object style
     * @param style - style to add
     * @example ```typescript
     * el.setStyle( {left:100} );
     */
    setStyle(style: object): void;
    /**
     * change a style value
     * @param name string style nale
     * @param value any style value or null to remove style
     */
    setStyleValue(name: string, value: any): void;
    private _setDomStyleValue;
    /**
     * compute the element style
     * @return all styles computed
     */
    getComputedStyle(pseudoElt?: string): ComputedStyle;
    /**
     * return a single stype value
     * @param name - value to get
     */
    getStyleValue(name: string): any;
    /**
     * define the elements attributes
     * @param attrs
     */
    setAttributes(attrs: any): void;
    /**
     * change a single attribute
     * @param name attribute name
     * @param value new value
     */
    setAttribute(name: string, value: any): void;
    private _setDomAttribute;
    /**
     * remove an atrribute
     * @param name name of the attribute
     */
    removeAttribute(name: string): void;
    /**
     * get an attribute value
     * @param {string} name - attribute name
     * @return {string} attribute value
     * @example ```typescript
     * let chk = el.getAttribute( 'checked' );
     * @review double cache
     */
    getAttribute(name: string): string;
    /**
     * check if the element has an attribute
     * @param name attribute name
     * @return true is attribute is present
     * @example ```typescript
     * if( el.hasAttribute('checked') ) {
     * }
     */
    hasAttribute(name: string): boolean;
    /**
     * a some classnames to the component
     * classes can be separated by a space
     * @param cls class to add
     * @example ```typescript
     * addClass( 'my class name @flex' );
     */
    addClass(name: string): void;
    /**
     * Remove a class from the element
     * @param {string|array} name - classes in string form can be space separated
     *
     * @example ```typescript
     * el.removeClass( 'myclass' );
     * el.removeClass( 'myclass1 myclass2' );
     */
    removeClass(name: string): void;
    /**
     *
     * @param cls
     * @param set
     */
    setClass(cls: string, set: boolean): this;
    /**
     * Toggle a class from the element (if present remove, if absent add)
     * @param {string|string[]} name - classes in string form can be space separated
     * @example ```typescript
     * el.toggleClass( 'myclass' );
     * el.toggleClass( 'myclass1 myclass2');
     * el.toggleClass( ['myclass1','myclass2']);
     */
    toggleClass(name: string): void;
    /**
     * check if the object has the class
     * @param cls
     */
    hasClass(cls: string): boolean;
    /**
     * remove all classes from the object
     * this is usefull for component recycling & reusing
     */
    clearClasses(): string;
    /**
     * @deprecated
     */
    private Build;
    _build(): HTMLElement;
    render(props: P): void;
    _createDOM(): HTMLElement;
    protected _setTabIndex(tabIndex: number | boolean, defValue?: number): void;
    private static _observeCreation;
    dispose(): void;
    protected _dispose(with_dom: boolean, timers: boolean): void;
    componentDisposed(): void;
    componentCreated(): void;
    /**
     *
     */
    update(delay?: number): void;
    /**
     * empty the node
     */
    _empty(): void;
    _updateContent(): void;
    /**
     * @return the bounding rectangle
     * @example ```typescript
     * let rc = el.getBoundingRect( );
     * console.log( rc.left, rc.top, rc.right, rc.bottom );
     */
    getBoundingRect(withMargins?: boolean): Rect;
    /**
     * append a new dom event handler
     * @param name - you can specify multiple names separated by a space
     * @param handler
     * @example
     *
     * this.setDomEvent( 'drag drop', this._handleDrag, this );
     * this.setDomEvent( 'dblclick', this._handleDblClick, this );
     */
    setDomEvent<K extends keyof X4ElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: X4ElementEventMap[K]) => void): void;
    private _setDomEvent;
    /**
     *
     */
    clearDomEvent<K extends keyof X4ElementEventMap>(type: K): void;
    mapPropEvents<N extends keyof E>(props: P, ...elements: N[]): void;
    /**
     *
     * @param name
     * @param handler
     */
    createEvent(name: string, handler: Function): void;
    /**
     * dispatch a dom event to the appropriated component
     * called by the system
     */
    private static _dispatchEvent;
    /**
     * dispatch a dom event to the appropriated component
     * called by the system
     */
    private static _dispatchUnbubbleEvent;
    /**
     * called when a size change on an observed component
     */
    private static _observeSize;
    /**
     * enum all children recursively
     * @param recursive - if true do a full sub-child search
     * @param cb - callback
     * return true to stop enumeration
     */
    enumChilds(cb: (child: Component) => boolean | void, recursive?: boolean): boolean;
    /**
     * apprend a child to the DOM
     * @param props child to append (or string)
     */
    private _appendChild;
    /**
     * generate classes from the component inheritance
     * @example
     * Button extends Component will give
     * x-comp x-button
     */
    private _genClassName;
    /**
     * prepend the system class name prefix on a name if needed (if class starts with @)
     */
    private _makeCls;
    /**
     *
     */
    private static dispatchCaptures;
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
    protected static setCapture(initiator: Component, listener: EventHandler<UIEvent>): void;
    protected static releaseCapture(): void;
    /**
     * ensure the component is visible
     * @param: alignToTop
     */
    scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
    /**
     * search for a given css selector
     * @param selector
     * @returns child or null
     */
    queryItem<T extends Component>(selector: string): T;
    queryAll(selector: string, cb?: (el: Component) => void): HTMLElement[];
    /**
     * find a child with the given ID
     * @param id id (without '#')
     * @returns child or null
     *
     * @example
     * let btn = this.childWithId<Button>( 'myButtonId' );
     */
    itemWithId<T extends Component>(id: string): T;
    /**
     * find a child with given ref
     * @param ref
     * @return found child or null
     */
    itemWithRef<T = Component>(ref: string): T;
    /**
     *
     */
    get ref(): string;
    /**
     *
     */
    static getCss(): Stylesheet;
    /**
     * return the parent element
     * care, object must have been created (dom!=null)
     */
    getParent(): Component;
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
    static getElement<T extends Component>(dom: HTMLElement | Element, classname?: Constructor<T> | string): T;
    /**
     * compute the scrollbar size ( width = height)
     */
    static getScrollbarSize(): any;
    /**
     * check if the Component is visible to the user
     */
    isUserVisible(): boolean;
}
/**
 * warp <b>temporarily</b> a DOM element to be able to acces to exact API
 * @param dom dom element to wrap
 * @review qui libere le fly_element ? -> timeout
 */
export declare function flyWrap<T extends Component>(dom: HTMLElement | EventTarget): T;
/**
 * simple flex spacer
 */
export declare class Flex extends Component {
    constructor(props?: CProps);
}
/**
 * simple space between 2 elements
 */
export declare class Space extends Component {
    m_size: number | string;
    constructor(size: number | string);
    componentCreated(): void;
}
/**
 * sizable separator
 */
declare type SizeMode = null | 'minimize' | 'maximize' | 'restore';
export interface EvSize extends BasicEvent {
    readonly size: Size;
    readonly mode: SizeMode;
}
export declare function EvSize(size: Size, mode?: SizeMode, context?: any): EvSize;
interface SeparatorEventMap extends CEventMap {
    resize?: EvSize;
}
interface SeparatorProps extends CProps<SeparatorEventMap> {
    readonly orientation: 'vertical' | 'horizontal';
    readonly sizing: 'before' | 'after';
    readonly collapsible?: boolean;
}
export declare class Separator extends Component<SeparatorProps, SeparatorEventMap> {
    m_irect: Rect;
    m_delta: number;
    m_target: Component;
    constructor(props: SeparatorProps);
    render(): void;
    private _collapse;
    private _mousedown;
    _startMoving(x: number, y: number, ev: UIEvent): void;
    private _pointerMoved;
    private _findTarget;
}
/**
 * properties
 */
declare type SizerOverlaySens = 'left' | 'top' | 'right' | 'bottom' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
export interface EvOverlayResize extends BasicEvent {
    ui_event: UIEvent;
    sens: SizerOverlaySens;
}
export declare function EvOverlayResize(ui_event: UIEvent, sens: SizerOverlaySens, context?: any): EvOverlayResize;
interface SizerOverlayEventMap extends CEventMap {
    resize: EvSize;
    rawresize: EvOverlayResize;
}
export interface SizerOverlayProps extends CProps<SizerOverlayEventMap> {
    sens: SizerOverlaySens;
    target: Component;
    resize?: EventCallback<EvSize>;
}
export declare class SizerOverlay extends Component<SizerOverlayProps, SizerOverlayEventMap> {
    private m_delta;
    private m_irect;
    constructor(props: SizerOverlayProps);
    resetflex(event: UIEvent): void;
    _mousedown(ev: UIEvent): void;
    private _is_horz;
    get sens(): SizerOverlaySens;
    private _handle_mouse;
}
/**
 * sequence: Shift+Ctrl+Alt+A
 */
export interface Shortcut {
    sequence: string;
    name: string;
    immediate: boolean;
    callback?: (domTarget: any) => void;
}
interface EvShortcut extends BasicEvent {
    name: string;
}
declare function EvShortcut(name: string): EvShortcut;
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
export declare class Container<P extends ContainerProps = ContainerProps, E extends ContainerEventMap = ContainerEventMap> extends Component<P, E> {
    private m_shortcuts;
    constructor(props: P | ComponentOrString[]);
    /**
     * add an application shortcut
     * @param sequence key sequence Shift+Ctrl+Alt+K
     * @param callback callback to call
     */
    addShortcut(sequence: string | string[], name: string, callback?: EventHandler<KeyboardEvent>, immediate?: boolean): void;
    /**
     * remove all shortcuts for a target
     */
    removeShortcuts(): void;
    /** @ignore this function is binded */
    private _handleKeydown;
}
export declare type ComponentConstructor<T> = new (props: CProps) => T;
