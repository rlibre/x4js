"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSource = exports.EvError = exports.EvDrag = exports.EvMessage = exports.EvTimer = exports.EvContextMenu = exports.EvSelectionChange = exports.EvChange = exports.EvClick = exports.BasicEvent = void 0;
// default stopPropagation implementation for Events
const stopPropagation = function () {
    this.propagationStopped = true;
};
// default preventDefault implementation for Events
const preventDefault = function () {
    this.defaultPrevented = true;
};
;
/**
 * BasicEvent Builder
 * this function is responsable of BasicEvent creation
 * ie. is equivalent of new BasicEvent( xxx );
 * @param params
 * @returns BasicEvent
 */
function BasicEvent(params) {
    return {
        stopPropagation,
        preventDefault,
        ...params,
    };
}
exports.BasicEvent = BasicEvent;
function EvClick(context = null) {
    return BasicEvent({ context });
}
exports.EvClick = EvClick;
function EvChange(value, context = null) {
    return BasicEvent({ value, context });
}
exports.EvChange = EvChange;
function EvSelectionChange(selection, context = null) {
    return BasicEvent({ selection, context });
}
exports.EvSelectionChange = EvSelectionChange;
function EvContextMenu(uievent, context = null) {
    return BasicEvent({ uievent, context });
}
exports.EvContextMenu = EvContextMenu;
function EvTimer(timer, time = 0, context = null) {
    return BasicEvent({ timer, time, context });
}
exports.EvTimer = EvTimer;
function EvMessage(msg, params, source) {
    return BasicEvent({ msg, params, source });
}
exports.EvMessage = EvMessage;
function EvDrag(element, data, ctx) {
    return BasicEvent({ element, data, context: ctx });
}
exports.EvDrag = EvDrag;
function EvError(code, message) {
    return BasicEvent({ code, message });
}
exports.EvError = EvError;
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
class EventSource {
    m_source;
    m_eventRegistry;
    m_defaultHandlers;
    constructor(source = null) {
        this.m_source = source ?? this;
    }
    /**
     * emit an event
     * you can stop propagation of event or prevent default
     * @param eventName - name of event to emit
     * @param event - event data
     */
    emit(type, event) {
        this._emit(type, event);
    }
    _emit(eventName, e) {
        let listeners = this.m_eventRegistry?.get(eventName);
        const defaultHandler = this.m_defaultHandlers?.get(eventName);
        if (!e) {
            e = {};
        }
        if (!e.source) {
            e.source = this.m_source;
        }
        if (!e.type) {
            e.type = eventName;
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
    signal(type, event, delay = -1) {
        this._signal(type, event, delay);
    }
    _signal(eventName, e, delay = -1) {
        if (!this.m_eventRegistry) {
            return;
        }
        const listeners = this.m_eventRegistry.get(eventName);
        if (!listeners || !listeners.length) {
            return;
        }
        if (!e) {
            e = {};
        }
        if (!e.type) {
            e.type = eventName;
        }
        if (!e.source) {
            e.source = this.m_source;
        }
        e.preventDefault = e.stopPropagation = () => {
            console.error('this event cannot be stopped not default prevented');
        };
        // small optimisation
        if (listeners.length == 1 && delay == -1) {
            listeners[0](e);
        }
        else {
            const temp = listeners.slice();
            const call = () => {
                for (let i = 0, n = temp.length; i < n; i++) {
                    temp[i](e);
                }
            };
            if (delay == -1) {
                call();
            }
            else {
                setTimeout(call, delay);
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
    once(type, callback) {
        //@ts-ignore
        this._once(type, callback);
    }
    _once(eventName, callback) {
        const newCallback = (ev) => {
            this._off(eventName, newCallback);
            callback(ev);
        };
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
    setDefaultHandler(eventName, callback) {
        let handlers = this.m_defaultHandlers;
        if (!handlers) {
            handlers = this.m_defaultHandlers = new Map();
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
    removeDefaultHandler(eventName, callback) {
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
    listen(events) {
        for (let n in events) {
            this._on(n, events[n]);
        }
    }
    /**
     * define a set of default handlers in one call
     * @param events
     */
    defaults(events) {
        for (let n in events) {
            this.setDefaultHandler(n, events[n]);
        }
    }
    /**
     * listen for an event
     * @param eventName - event name to listen on
     * @param callback - callback to call
     * @param capturing - if true, capture event before other registred event handlers
     */
    on(type, callback) {
        //@ts-ignore
        return this._on(type, callback);
    }
    _on(eventName, callback, capturing = false) {
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
            dispose: () => { this._off(eventName, callback); }
        };
    }
    /**
     * stop listening to an event
     * @param eventName - event name
     * @param callback - callback to remove (must be the same as in on )
     */
    off(type, callback) {
        //@ts-ignore
        return this._off(type, callback);
    }
    _off(eventName, callback) {
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
    removeAllListeners(eventName) {
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
exports.EventSource = EventSource;
