/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file action.ts
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
import { BasicEvent } from './x4events';
import { BaseComponent, BaseComponentEventMap, BaseComponentProps } from './base_component';
import { IconID } from "./icon";
import { EvChange, EventHandler } from 'x4js';
export interface EvAction extends BasicEvent {
}
export declare function EvAction(source: Action): EvAction;
interface ActionEventMap extends BaseComponentEventMap {
    run: EvAction;
    change: EvChange;
}
interface ActionProps extends BaseComponentProps<ActionEventMap> {
    id?: any;
    text?: string;
    icon?: IconID;
    disabled?: boolean;
    hidden?: boolean;
    checked?: boolean;
    run: EventHandler<EvAction>;
    change?: EventHandler<EvChange>;
}
export declare class Action extends BaseComponent<ActionProps, ActionEventMap> {
    constructor(props: ActionProps);
    get props(): ActionProps;
    set text(t: string);
    set icon(i: IconID);
    fire(): void;
}
export {};
