/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file base_component.ts
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
*
**/

import { EventMap, MapEvents, EventSource, EvTimer } from './x4events';

/**
 * Timer Callback
 * @see EvTimer, startTimer, stopTimer
 */

 interface TimerCallback {
	(name: string, time: number): void;
}

/**
 * BaseComponent EventMap
 */

export interface BaseComponentEventMap extends EventMap {
	timer: EvTimer,
}

/**
 * BaseCompoment Properties
 */

export interface BaseComponentProps<T = BaseComponentEventMap> {
	events?: MapEvents<T>;	// basic component event map in base interface, should specialised in derived interfaces
}

/**
 * BaseComponent class
 */

export class BaseComponent< P extends BaseComponentProps<BaseComponentEventMap>, E extends BaseComponentEventMap >
	extends EventSource< E > {

	protected m_props: P;
	#m_timers: Map<string, Function>;

	constructor(props: P) {
		super();

		//this.m_props = { ...props };
		this.m_props = props;

		if (props.events) {
			this.listen(props.events as EventMap);
		}
	}

	/**
	 * start a new timer
	 * @param name timer name 
	 * @param timeout time out in ms
	 * @param repeat if true this is an auto repeat timer
	 * @param callback if !null, the callback to call else a EvTimer is fired
	 */

	startTimer(name: string, timeout: number, repeat = true, callback: TimerCallback = null) {
		if (!this.#m_timers) {
			this.#m_timers = new Map();
		}
		else {
			this.stopTimer(name);
		}

		const id = (repeat ? setInterval : setTimeout)((tm: number) => {
			if (callback) {
				callback(name, tm);
			}
			else {
				this.emit('timer', EvTimer( name, tm ));
			}
		}, timeout);

		this.#m_timers.set(name, () => { (repeat ? clearInterval : clearTimeout)(id) });
	}

	/**
	 * stop the given timer
	 * @param name 
	 */

	stopTimer(name: string) {
		const clear = this.#m_timers.get(name);
		if (clear) { clear(); }
	}

	/**
	 * stop all timers
	 */

	disposeTimers( ) {
		this.#m_timers?.forEach( v => v() );
		this.#m_timers = undefined;
	}

	/**
	 * 
	 * @param callback 
	 * @param timeout 
	 */

	singleShot( callback: TimerCallback, timeout = 0 ) {
		setTimeout( callback, timeout );
	}
}