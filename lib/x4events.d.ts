/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file x4events.ts
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
export declare type EventCallback<T extends BasicEvent = BasicEvent> = (event: T) => any;
export interface EventDisposer {
    dispose(): void;
}
/**
 * Basic event
 * name like that to avoid conflict with Browsers Event class.
 */
export interface BasicEvent {
    readonly type?: string;
    readonly source?: unknown;
    readonly context?: any;
    propagationStopped?: boolean;
    defaultPrevented?: boolean;
    stopPropagation?(): void;
    preventDefault?(): void;
}
/**
 * BasicEvent Builder
 * this function is responsable of BasicEvent creation
 * ie. is equivalent of new BasicEvent( xxx );
 * @param params
 * @returns BasicEvent
 */
export declare function BasicEvent<T extends BasicEvent = BasicEvent>(params: any): T;
/**
 * Click Event
 * click event do not have any additional parameters
 */
export interface EvClick extends BasicEvent {
}
export declare function EvClick(context?: any): EvClick;
/**
 * Change Event
 * value is the the element value
 */
export interface EvChange extends BasicEvent {
    readonly value: any;
}
export declare function EvChange(value: unknown, context?: any): EvChange;
/**
 * Selection Event
 * value is the new selection or null
 */
interface X4Selection {
}
export interface EvSelectionChange extends BasicEvent {
    readonly selection: X4Selection;
}
export declare function EvSelectionChange(selection: X4Selection, context?: any): EvSelectionChange;
/**
 * ContextMenu Event
 */
export interface EvContextMenu extends BasicEvent {
    uievent: UIEvent;
}
export declare function EvContextMenu(uievent: UIEvent, context?: any): EvContextMenu;
/**
 * Timer Event
 * @see startTimer, stopTimer
 */
export interface EvTimer extends BasicEvent {
    timer: string;
    time: number;
}
export declare function EvTimer(timer: string, time?: number, context?: any): EvTimer;
/**
 * Simple message
 */
export interface EvMessage extends BasicEvent {
    readonly msg: string;
    readonly params?: any;
}
export declare function EvMessage(msg: string, params?: unknown, source?: unknown): EvMessage;
/**
 * Drag/Drop event
 */
export interface EvDrag extends BasicEvent {
    element: unknown;
    data: any;
}
export declare function EvDrag(element: unknown, data: any, ctx: any): EvDrag;
/**
 * Errors
 */
export interface EvError extends BasicEvent {
    code: number;
    message: string;
}
export declare function EvError(code: number, message: string): EvError;
/**
 * this Base interface is used to describe available events & their types
 *
 * you can implement your own event mapping:
 * @example
 * ```ts
 * interface MyEventMap extends EventMap {
 * 	  click: EvClick,
 *    'custom-message': Event,
 * 	  [key: string]: Event,
 * }
 * ```
 */
export interface EventMap {
}
/**
 * basic event types, in general the type is builded from the eventMap
 * this is very usefull for editor completion
 * @example
 * ```ts
 * type MyEventType = MapEvents<MyEventMap>;
 * ```
 */
export interface EventTypes {
}
/**
 * convert an EventMap to a EventType
 */
export declare type MapEvents<Type> = {
    [Property in keyof Type]?: (ev: Type[Property]) => any;
};
/**
 * Event emitter class
 * this class allow you to emit and handle events
 *
 * @example:
 * ```ts
 *
 * interface EvDoIt extends BasicEvent {
 *   param: unknown;
 * }
 *
 * function EvDoIt( e: EvDoIt ) : EvDoIt {
 *   return BasicEvent<EvDoIt>( e );
 * }
 *
 * interface TestEventMap extends EventMap {
 *	doit: EvDoIt;
 * }
 *
 * let ee = new EventSource<TestEventMap>(null);
 * ee.listen({
 *	doit: (e) => {
 *		console.log(e);
 *		e.preventDefault();
 *	},
 * });
 *
 * ee.defaults({
 *	doit: (e) => {
 *		console.log('default handler for ', e.type, e.selection);
 *	},
 * })
 *
 * ee.on('doit', (e) => {
 *	debugger;
 * })
 *
 * const ev = EvDoIt({ param: 10 });
 * ee.emit('change', ev);
 * if (ev.defaultPrevented) {
 *	console.log('prevented');
 * }
 * ```
 */
export declare class EventSource<Q extends EventMap, T extends EventTypes = MapEvents<Q>> {
    private m_source;
    private m_eventRegistry;
    private m_defaultHandlers;
    constructor(source?: unknown);
    /**
     * emit an event
     * you can stop propagation of event or prevent default
     * @param eventName - name of event to emit
     * @param event - event data
     */
    emit<K extends keyof Q>(type: K, event?: Q[K]): void;
    _emit(eventName: string, e: BasicEvent): void;
    /**
     * signal en event
     * signaled event are notification : no way to prevent default not stop propagation
     * @param eventName name of event to signal
     * @param event event data
     */
    signal<K extends keyof Q>(type: K, event: Q[K], delay?: number): void;
    _signal(eventName: string, e: BasicEvent, delay?: number): void;
    /**
     * handle an event one time
     * @param eventName - event name to handle
     * @param callback - callback to call when event is signaled
     * @returns Promise if callback is null
     *
     * take care with that because if the event is never fired and you await it,
     * the system may overflow
     */
    once<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any): void;
    _once(eventName: string, callback: EventCallback): Promise<unknown>;
    /**
     * set the event default handler
     * @param eventName - name of the event
     * @param callback - callback to call when the event is not handled (and preventDeault has not been called)
     */
    setDefaultHandler(eventName: string, callback: EventCallback): void;
    /**
     * remove the previous default handler installed for an event
     * @param eventName - event name
     * @param callback - callback handler to remove (must be the same as in setDefaultHandler)
     */
    removeDefaultHandler(eventName: string, callback: EventCallback): void;
    /**
     * define a set of listeners in one call
     * @param events
     */
    listen(events: T): void;
    /**
     * define a set of default handlers in one call
     * @param events
     */
    defaults(events: T): void;
    /**
     * listen for an event
     * @param eventName - event name to listen on
     * @param callback - callback to call
     * @param capturing - if true, capture event before other registred event handlers
     */
    on<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any): EventDisposer;
    _on(eventName: string, callback: EventCallback, capturing?: boolean): EventDisposer;
    /**
     * stop listening to an event
     * @param eventName - event name
     * @param callback - callback to remove (must be the same as in on )
     */
    off<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any): void;
    _off(eventName: string, callback: EventCallback): void;
    /**
     * remove all listeners for an event
     * @param eventName - event name
     */
    removeAllListeners(eventName: string | null): void;
}
export {};
