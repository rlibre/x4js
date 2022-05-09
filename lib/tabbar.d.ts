/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tabbar.ts
* @author Etienne Cochard
* @copyright (c) 2021 R-libre ingenierie, all rights reserved.
*
* @description Tab
**/
import { Component, Container, ContainerEventMap, CProps, EventHandler } from './component';
import { EvChange } from './x4_events';
import { IconID } from './icon.js';
interface TabBarEventMap extends ContainerEventMap {
    change: EvChange;
}
interface TabBarProps extends CProps<TabBarEventMap> {
    pages?: ITabPage[];
    default?: string;
    vertical?: boolean;
    change: EventHandler<EvChange>;
}
export interface ITabPage {
    id: string;
    title?: string;
    icon?: IconID;
    page: Component;
}
export declare class TabBar extends Container<TabBarProps, TabBarEventMap> {
    private m_pages;
    private m_curPage;
    constructor(props: TabBarProps);
    addPage(page: ITabPage): void;
    render(): void;
    select(id: string): void;
    private _select;
}
export {};
