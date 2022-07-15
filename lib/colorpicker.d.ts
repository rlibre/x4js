/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file colorpicker.ts
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
/**
 * ARGH this code is awfull
 */
import { Container, ContainerProps, ContainerEventMap } from './component';
import { Dialog, DialogBoxEventMap, DialogProps } from './dialog';
import { EvChange, EventCallback } from './x4events';
import { HLayout } from './layout';
import { Color } from './color';
interface ColorPickerEventMap extends ContainerEventMap {
    change: EvChange;
}
export interface ColorPickerProps extends ContainerProps<ColorPickerEventMap> {
    color: Color;
    hasAlpha?: boolean;
}
export declare class ColorPicker extends Container<ColorPickerProps, ColorPickerEventMap> {
    private m_colorSel;
    private m_colorHue;
    private m_colorAlpha;
    private m_sample;
    private m_selMark;
    private m_hueMark;
    private m_alphaMark;
    private m_baseHSV;
    private m_baseColor;
    private m_transpCk;
    private m_colorEdit;
    private m_palmode;
    static last_palmode: boolean;
    constructor(props: ColorPickerProps);
    private _showCtx;
    render(props: ColorPickerProps): void;
    set color(clr: Color);
    get color(): Color;
    private _selChange;
    private _hueChange;
    private _alphaChange;
    private _updateColor;
    private _change;
}
interface ColorPickerBoxEventMap extends DialogBoxEventMap {
    change: EvChange;
}
export interface ColorPickerBoxProps extends DialogProps<ColorPickerBoxEventMap> {
    color: Color;
    hasAlpha?: boolean;
    cust_colors?: Color[];
    change?: EventCallback<EvChange>;
}
export declare class ColorPickerBox extends Dialog<ColorPickerBoxProps, ColorPickerBoxEventMap> {
    private m_picker;
    constructor(props: ColorPickerBoxProps);
    private _makeCustoms;
    set color(clr: Color);
    get color(): Color;
    /**
     * display a messagebox
     */
    static show(props: string | ColorPickerBoxProps): ColorPickerBox;
}
export interface ColorPickerEditorProps extends ColorPickerProps {
    label?: string;
    labelWidth?: number;
    cust_colors?: Color[];
    displayValue?: false;
    change: EventCallback<EvChange>;
}
export declare class ColorPickerEditor extends HLayout<ColorPickerEditorProps, ColorPickerEventMap> {
    constructor(props: ColorPickerEditorProps);
    render(props: ColorPickerEditorProps): void;
    set value(color: Color);
    get value(): Color;
    set custom_colors(v: Color[]);
    private _showPicker;
    private _change;
    private _isTransp;
}
export {};
