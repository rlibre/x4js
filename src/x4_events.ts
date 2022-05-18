/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file observable.ts
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

// default stopPropagation implementation for Events
const stopPropagation = function ( this: any ) {
	this.propagationStopped = true;
}

// default preventDefault implementation for Events
const preventDefault = function ( this: any ) {
	this.defaultPrevented = true;
}

// default callback type for events
export type EventCallback<T extends BasicEvent = BasicEvent> = (event: T) => any;
export interface EventDisposer {
	dispose( ) : void;
};


/**
 * Basic event
 * name like that to avoid conflict with Browsers Event class.
 */

export interface BasicEvent {
	readonly type?: string;			// type of the event 'click', 'change', ...
	readonly source?: unknown;		// object that fires the event
	readonly context?: any;		// contextual data, left to the user

	propagationStopped?: boolean;	// if true, do not propagate the event
	defaultPrevented?: boolean;		// if true, do not call default handler (if any)

	stopPropagation?(): void;		// stop the propagation
	preventDefault?(): void;		// prevent the default handler
}

/**
 * BasicEvent Builder
 * this function is responsable of BasicEvent creation
 * ie. is equivalent of new BasicEvent( xxx );
 * @param params 
 * @returns BasicEvent
 */

export function BasicEvent<T extends BasicEvent = BasicEvent>(params: any): T {
	return {
		stopPropagation,
		preventDefault,
		...params,
	} as T;
}

/**
 * Click Event
 * click event do not have any additional parameters
 */

export interface EvClick extends BasicEvent {
}

export function EvClick( context = null ) {
	return BasicEvent<EvClick>({ context });
}


/**
 * Change Event
 * value is the the element value
 */

export interface EvChange extends BasicEvent {
	readonly value: any;
}

export function EvChange(value: unknown, context = null ) {
	return BasicEvent<EvChange>({ value, context });
}

/**
 * Selection Event
 * value is the new selection or null
 */

export interface EvSelectionChange extends BasicEvent {
	readonly selection: unknown;
}

export function EvSelectionChange( selection: unknown, context = null ) {
	return BasicEvent<EvSelectionChange>( { selection, context } );
}

/**
 * ContextMenu Event
 */

export interface EvContextMenu extends BasicEvent {
	uievent: UIEvent;	// UI event that fire this event
}

export function EvContextMenu( uievent: UIEvent, context = null ) {
	return BasicEvent<EvContextMenu>( { uievent, context } );
}

/**
 * Timer Event
 * @see startTimer, stopTimer
 */

export interface EvTimer extends BasicEvent {
	timer: string;
	time: number;
}

export function EvTimer( timer: string, time = 0, context = null ) {
	return BasicEvent<EvTimer>( { timer, time, context });
}

/**
 * Simple message
 */

export interface EvMessage extends BasicEvent {
	readonly msg: string;
	readonly params?: any;
}

export function EvMessage( msg: string, params?: unknown, source?: unknown ) {
	return BasicEvent<EvMessage>({msg,params,source});
}

/**
 * Drag/Drop event
 */

export interface EvDrag extends BasicEvent {
	element: unknown;
	data: any;
}

export function EvDrag(element: unknown, data: any, ctx: any ) {
	return BasicEvent<EvDrag>({ element, data, context: ctx });
}

/**
 * Errors
 */

export interface EvError extends BasicEvent {
	code: number;
	message: string;
}
	
export function EvError( code: number, message: string ) : EvError {
	return BasicEvent<EvError>( {code, message} );
}


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

export type MapEvents<Type> = {
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

export class EventSource<Q extends EventMap, T extends EventTypes = MapEvents<Q>> {

	private m_source: unknown;
	private m_eventRegistry: Map<string, EventCallback[]>;
	private m_defaultHandlers: Map<string, EventCallback[]>;

	constructor(source: unknown = null) {
		this.m_source = source ?? this;
	}

	/**
	 * emit an event
	 * you can stop propagation of event or prevent default
	 * @param eventName - name of event to emit
	 * @param event - event data 
	 */

	emit<K extends keyof Q>(type: K, event?: Q[K]) {
		this._emit(type as string, event);
	}

	_emit(eventName: string, e: BasicEvent): void {
		let listeners = this.m_eventRegistry?.get(eventName);
		const defaultHandler = this.m_defaultHandlers?.get(eventName);

		if (!e) {
			e = {};
		}

		if (!e.source) {
			(e as any).source = this.m_source;
		}

		if (!e.type) {
			(e as any).type = eventName;
		}

		if (listeners && listeners.length) {

			if (!e.preventDefault) {
				e.preventDefault = preventDefault;
			}

			if (!e.stopPropagation) {
				e.stopPropagation = stopPropagation;
			}

			// small optimisation
			if (listeners.length == 1) {
				listeners[0](e);
			}
			else {
				const temp = listeners.slice();
				for (let i = 0, n = temp.length; i < n; i++) {
					temp[i](e);
					if (e.propagationStopped) {
						break;
					}
				}
			}
		}

		if (defaultHandler && defaultHandler.length && !e.defaultPrevented) {
			return defaultHandler[0](e);
		}
	}

	/**
	 * signal en event
	 * signaled event are notification : no way to prevent default not stop propagation
	 * @param eventName name of event to signal
	 * @param event event data 
	 */

	signal<K extends keyof Q>(type: K, event: Q[K], delay=-1) {
		this._signal(type as string, event,delay);
	}

	_signal(eventName: string, e: BasicEvent,delay=-1): void {

		if (!this.m_eventRegistry) {
			return;
		}

		const listeners = this.m_eventRegistry.get(eventName);
		if (!listeners || !listeners.length ) {
			return;
		}

		if (!e) {
			e = {};
		}

		if (!e.type) {
			(e as any).type = eventName;
		}

		if (!e.source) {
			(e as any).source = this.m_source;
		}

		e.preventDefault = e.stopPropagation = () => {
			console.error('this event cannot be stopped not default prevented');
		}

		// small optimisation
		if (listeners.length == 1 && delay==-1 ) {
			listeners[0](e);
		}
		else {
			const temp = listeners.slice();

			const call = ( ) => {
				for (let i = 0, n = temp.length; i < n; i++) {
					temp[i](e);
				}
			}

			if( delay==-1 ) {
				call( );
			}
			else {
				setTimeout( call, delay );
			}
		}
	}

	/**
	 * handle an event one time
	 * @param eventName - event name to handle
	 * @param callback - callback to call when event is signaled
	 * @returns Promise if callback is null
	 * 
	 * take care with that because if the event is never fired and you await it,
	 * the system may overflow
	 */

	once<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any) {
		//@ts-ignore
		this._once(type as string, callback);
	}

	_once(eventName: string, callback: EventCallback) {

		const newCallback = ( ev ) => {
			this._off(eventName, newCallback);
			callback( ev );
		}

		this._on(eventName, newCallback);

		if (!callback) {
			return new Promise(function (resolve) {
				callback = resolve;
			});
		}
	}

	/**
	 * set the event default handler
	 * @param eventName - name of the event
	 * @param callback - callback to call when the event is not handled (and preventDeault has not been called)
	 */

	setDefaultHandler(eventName: string, callback: EventCallback): void {

		let handlers = this.m_defaultHandlers;
		if (!handlers) {
			handlers = this.m_defaultHandlers = new Map()
		}

		let stack = handlers.get(eventName);
		if (stack) {

			// if already in the stack, remove it
			const idx = stack.indexOf(callback);
			if (idx != -1) {
				stack.splice(idx, 1);
			}

			// then make it first
			stack.unshift(callback);
		}
		else {
			handlers.set(eventName, [callback]);
		}
	}

	/**
	 * remove the previous default handler installed for an event
	 * @param eventName - event name
	 * @param callback - callback handler to remove (must be the same as in setDefaultHandler)
	 */

	removeDefaultHandler(eventName: string, callback: EventCallback): void {
		const handlers = this.m_defaultHandlers;
		if (!handlers) {
			return;
		}

		const stack = handlers.get(eventName);
		if (stack) {
			const idx = stack.indexOf(callback);
			if (idx != -1) {
				stack.splice(idx, 1);
			}
		}
	}

	/**
	 * define a set of listeners in one call
	 * @param events 
	 */

	listen(events: T) {
		for (let n in events) {
			this._on(n, events[n] as unknown as EventCallback);
		}
	}

	/**
	 * define a set of default handlers in one call
	 * @param events 
	 */

	defaults(events: T) {
		for (let n in events) {
			this.setDefaultHandler(n, events[n] as unknown as EventCallback);
		}
	}

	/**
	 * listen for an event
	 * @param eventName - event name to listen on
	 * @param callback - callback to call
	 * @param capturing - if true, capture event before other registred event handlers
	 */

	on<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any) : EventDisposer {
		//@ts-ignore
		return this._on(type as string, callback);
	}

	_on(eventName: string, callback: EventCallback, capturing = false): EventDisposer {

		if (!this.m_eventRegistry) {
			this.m_eventRegistry = new Map();
		}

		let listeners = this.m_eventRegistry.get(eventName);
		if (!listeners) {
			listeners = [];
			this.m_eventRegistry.set(eventName, listeners);
		}

		if (listeners.indexOf(callback) == -1) {
			if (capturing) {
				listeners.unshift(callback);
			}
			else {
				listeners.push(callback);
			}
		}

		return {
			dispose: ( ) => { this._off( eventName, callback ); } 
		}
	}

	/**
	 * stop listening to an event
	 * @param eventName - event name
	 * @param callback - callback to remove (must be the same as in on )
	 */

	off<K extends keyof Q>(type: K, callback: (ev: Q[K]) => any) {
		//@ts-ignore
		return this._off(type as string, callback);
	}

	_off(eventName: string, callback: EventCallback ): void {
		if (!this.m_eventRegistry) {
			return;
		}

		let listeners = this.m_eventRegistry.get(eventName);
		if (!listeners) {
			return;
		}

		const idx = listeners.indexOf(callback);
		if (idx !== -1) {
			listeners.splice(idx, 1);
		}
	}

	/**
	 * remove all listeners for an event
	 * @param eventName - event name 
	 */

	removeAllListeners(eventName: string | null): void {
		if (!eventName) {
			this.m_eventRegistry = this.m_defaultHandlers = undefined;
		}
		else {
			if (this.m_eventRegistry) {
				this.m_eventRegistry[eventName] = undefined;
			}

			if (this.m_defaultHandlers) {
				this.m_defaultHandlers[eventName] = undefined;
			}
		}
	}
}