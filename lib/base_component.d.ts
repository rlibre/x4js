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
