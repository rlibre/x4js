/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file form.ts
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
import { Component, Container, CProps, ContainerEventMap, ComponentContent } from './component';
import { HLayout, VLayout } from './layout';
import { Button } from './button';
import { RequestProps } from './request';
import { EventCallback } from './x4_events';
import { EvBtnClick } from './dialog';
export declare type FormBtn = 'ok' | 'cancel' | 'ignore' | 'yes' | 'no' | 'close' | 'save' | 'dontsave';
export declare type FormButtons = (FormBtn | Button | Component)[];
export interface FormEventMap extends ContainerEventMap {
    btnClick?: EvBtnClick;
}
export interface FormProps extends CProps<FormEventMap> {
    disableSuggestions?: boolean;
    buttons?: FormButtons;
    btnClick?: EventCallback<EvBtnClick>;
}
/**
 *
 */
export declare class Form extends VLayout<FormProps, FormEventMap> {
    protected m_height: string | number;
    protected m_container: Container;
    protected m_buttons: HLayout;
    protected m_dirty: boolean;
    protected m_watchChanges: boolean;
    constructor(props: FormProps);
    /**
     * returns the container object
     */
    get container(): Container;
    /**
     *
     */
    componentCreated(): void;
    /**
     *
     */
    updateContent(items: ComponentContent, buttons: FormButtons, height?: string | number): void;
    /**
     *
     * @param els
     * @param refreshAll
     */
    setContent(els: ComponentContent, refreshAll?: boolean): void;
    /**
     *
     * @param buttons
     */
    setButtons(buttons: FormButtons): void;
    /**
     * enable a button by it's name
     */
    enableButton(name: string, enable?: boolean): void;
    /**
     * return a button by it's name
     * @param name
     */
    getButton(name: string): Button;
    /**
     *
     */
    private _makeButtons;
    /**
     *
     */
    validate(): boolean;
    /**
     *
     */
    private _click;
    /**
     * replacement for HTMLFormElement.elements
     * as chrome shows suggestions on form elements even if we ask him (not to do that)
     * we removed <form> element.
     * so we have to get children by hand
     */
    private _getElements;
    /**
     *
     */
    setValues(values: any): void;
    /**
     * values are not escaped
     * checkbox set true when checked
     * radio set value when checked
     */
    getValues(): any;
    /**
     * send the query to the desired handler
     */
    submit(cfg: RequestProps, cbvalidation: Function): false | Function;
    /**
     *
     */
    watchChanges(): void;
    setDirty(set?: boolean): void;
    isDirty(): boolean;
}
