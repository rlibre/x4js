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
    timer: EvTimer;
}
/**
 * BaseCompoment Properties
 */
export interface BaseComponentProps<T = BaseComponentEventMap> {
    events?: MapEvents<T>;
}
/**
 * BaseComponent class
 */
export declare class BaseComponent<P extends BaseComponentProps<BaseComponentEventMap>, E extends BaseComponentEventMap> extends EventSource<E> {
    #private;
    protected m_props: P;
    constructor(props: P);
    /**
     * start a new timer
     * @param name timer name
     * @param timeout time out in ms
     * @param repeat if true this is an auto repeat timer
     * @param callback if !null, the callback to call else a EvTimer is fired
     */
    startTimer(name: string, timeout: number, repeat?: boolean, callback?: TimerCallback): void;
    /**
     * stop the given timer
     * @param name
     */
    stopTimer(name: string): void;
    /**
     * stop all timers
     */
    disposeTimers(): void;
    /**
     *
     * @param callback
     * @param timeout
     */
    singleShot(callback: TimerCallback, timeout?: number): void;
}
export {};
