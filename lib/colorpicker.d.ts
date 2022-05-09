/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file colorpicker.ts
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
import { Container, ContainerProps, ContainerEventMap } from './component';
import { Dialog, DialogBoxEventMap, DialogProps } from './dialog';
import { EvChange, EventCallback } from './x4_events';
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
