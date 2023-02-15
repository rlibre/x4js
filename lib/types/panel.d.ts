/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file panel.ts
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
import { Component, ComponentContent, ContainerProps, ContainerEventMap } from './component';
import { VLayout } from './layout';
import { IconID } from './icon';
export interface PanelProps<E extends ContainerEventMap = ContainerEventMap> extends ContainerProps<E> {
    icon?: IconID;
    title: string;
    gadgets?: Component[];
    sens?: 'horizontal' | 'vertical';
    bodyStyle?: any;
}
export declare class Panel<T extends PanelProps = PanelProps, E extends ContainerEventMap = ContainerEventMap> extends VLayout<T, E> {
    private m_ui_title;
    private m_ui_body;
    constructor(props: T);
    /** @ignore */
    render(): void;
    setContent(els: ComponentContent): void;
    set title(text: string);
}
