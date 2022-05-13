/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file drawtext.ts
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
