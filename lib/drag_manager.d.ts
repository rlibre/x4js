import { Component } from './component';
import { Point } from './tools';
declare type DropCallback = (command: 'enter' | 'leave' | 'drag' | 'drop', el: Component, point: Point) => void;
declare type FilterCallback = (el: Component) => boolean;
/**
 *
 */
declare class DragManager {
    dragSource: Component;
    dragGhost: HTMLElement;
    dropTarget: Component;
    notified: Component;
    timer: any;
    /**
     *
     */
    registerDraggableElement(el: Component): void;
    /**
     *
     */
    registerDropTarget(el: Component, cb: DropCallback, filterCB: FilterCallback): void;
    _startCheck(): void;
    _check(): void;
}
export declare const dragManager: DragManager;
export {};
