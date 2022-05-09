/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file drawtext.ts
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
import { Rect } from './tools';
export interface DrawTextStyle {
    align?: 'left' | 'center' | 'right' | 'justify';
    vAlign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    fontWeight?: number | 'bold' | 'light' | 'normal';
    fontStyle?: string;
    fontVariant?: string;
    fontFamily?: string;
    lineHeight?: number;
    clip?: boolean;
    columns?: number;
    columnGap?: number;
    lineBreak?: boolean;
    rotation?: number;
}
export declare function drawText(ctx: CanvasRenderingContext2D, input_Text: string, rc: Rect, drawStyle: DrawTextStyle): {
    height: number;
};
