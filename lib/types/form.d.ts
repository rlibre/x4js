/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file form.ts
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
import { Component, Container, CProps, ContainerEventMap, ComponentContent, EventHandler } from './component';
import { HLayout, VLayout } from './layout';
import { Button } from './button';
import { RequestProps } from './request';
import { BasicEvent } from './x4events';
import { EvBtnClick } from './dialog';
export interface EvDirty extends BasicEvent {
    dirty: boolean;
}
export type FormBtn = 'ok' | 'cancel' | 'ignore' | 'yes' | 'no' | 'close' | 'save' | 'dontsave';
export type FormButtons = (FormBtn | Button | Component)[];
export interface FormEventMap extends ContainerEventMap {
    btnClick?: EvBtnClick;
    dirty?: EvDirty;
}
export interface FormProps extends CProps<FormEventMap> {
    disableSuggestions?: boolean;
    buttons?: FormButtons;
    btnClick?: EventHandler<EvBtnClick>;
    dirty?: EventHandler<EvDirty>;
}
/**
 *
 */
export declare class Form<T extends FormProps = FormProps, E extends FormEventMap = FormEventMap> extends VLayout<T, E> {
    protected m_height: string | number;
    protected m_container: Container;
    protected m_buttons: HLayout;
    protected m_dirty: boolean;
    protected m_watchChanges: boolean;
    constructor(props: T);
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
     *
     */
    clearValues(): void;
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
     * to be abble to see the dirty flag, you need to call this method
     * cf. isDirty, setDirty
     */
    watchChanges(): void;
    /**
     * cf. watchChanges
     */
    setDirty(set?: boolean): void;
    /**
     * cf. watchChanges
     */
    isDirty(): boolean;
}
