/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file dialog.ts
* @author Etienne Cochard
* @license
* Copyright (c) 2019-2021 R-libre ingenierie
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
**/
import { Popup, PopupProps, PopupEventMap } from './popup';
import { IconID } from './icon';
import { Label } from './label';
import { Form, FormButtons } from './form';
import { Component, ComponentContent } from './component';
import { BasicEvent, EventCallback } from './x4_events';
import { Rect, Size } from './tools';
interface Geometry {
    left: number;
    top: number;
    width: number;
    height: number;
    minimized: boolean;
    maximized: boolean;
}
export interface EvClose extends BasicEvent {
}
export interface EvBtnClick extends BasicEvent {
    button: string;
}
export declare function EvBtnClick(button: string): EvBtnClick;
export interface DialogBoxEventMap extends PopupEventMap {
    close: EvClose;
    btnClick: EvBtnClick;
}
export declare type InitFormCallback = () => Form;
export interface DialogProps<E extends DialogBoxEventMap = DialogBoxEventMap> extends PopupProps<E> {
    title?: string;
    icon?: IconID;
    buttons?: FormButtons;
    btnClick?: EventCallback<EvBtnClick>;
    closable?: boolean;
    movable?: boolean;
    maximized?: boolean;
    maximizable?: boolean;
    minimizable?: boolean;
    autoClose?: boolean;
    width?: number;
    height?: number;
    dlgWidth?: number;
    dlgHeight?: number;
    form?: Form | InitFormCallback;
    disableSuggestions?: boolean;
}
/**
 * Standard dialog class
 */
export declare class Dialog<P extends DialogProps = DialogProps, E extends DialogBoxEventMap = DialogBoxEventMap> extends Popup<P, E> {
    protected m_icon: IconID;
    protected m_title: string;
    protected m_form: Form;
    protected m_buttons: FormButtons;
    protected m_closable: boolean;
    protected m_movable: boolean;
    protected m_maximized: boolean;
    protected m_minimized: boolean;
    protected m_maximizable: boolean;
    protected m_minimizable: boolean;
    protected m_minFormSize: Size;
    protected m_rc_max: Rect;
    protected m_rc_min: Rect;
    protected m_el_title: Component;
    protected m_last_down: number;
    protected m_auto_close: boolean;
    protected m_ui_title: Label;
    protected m_form_cb: InitFormCallback;
    constructor(props: P);
    /**
     *
     */
    componentCreated(): void;
    /**
     *
     */
    private _handleClick;
    /**
     * restore the geometry
     */
    setGeometry(geom: Geometry): void;
    /**
     * return the geometry (usefull to save state)
     */
    getGeometry(): Geometry;
    /**
     * resize the dialog
     * @param width
     * @param height
     */
    setSize(width: number, height: number): void;
    /** @ignore */
    render(): void;
    /**
     * change the dialog content
     * @param els
     * @param refreshAll
     */
    setContent(els: ComponentContent, refreshAll?: boolean): void;
    /**
     * change the dialog buttons
     * @param buttons
     */
    setButtons(buttons: FormButtons): void;
    /**
     * return the dialog form
     */
    get form(): Form;
    /**
     * close the dialog
     */
    close(): void;
    /**
     *
     */
    private _toggleMax;
    /**
     *
     */
    private _toggleMin;
    /**
     *
     */
    private _mouseDown;
    /**
     * maximize the dialog
     */
    maximize(): void;
    /**
     *
     */
    private _maximize;
    /**
     * minimize the dialog
     */
    minimize(): void;
    /**
     *
     */
    private _minimize;
    /**
     * change the dialog title
     */
    set title(title: string);
    itemWithName<T extends Component>(name: string): T;
    getValues(): any;
    validate(): boolean;
}
export {};
