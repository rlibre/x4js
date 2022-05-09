/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file base_component.ts
* @author Etienne Cochard 
* @copyright (c) 2022 R-libre ingenierie, all rights reserved.
*
**/

import { EventMap, MapEvents, EventSource, EvTimer } from './x4_events';

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