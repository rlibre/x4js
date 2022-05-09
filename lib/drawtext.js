"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawText = void 0;
const tools_1 = require("./tools");
// adapted & modified from Canvas-txt: 
// https://github.com/geongeorge/Canvas-Txt/blob/master/src/index.js
// Hair space character for precise justification
const SPACE = '\u200a';
const defStyle = {
    align: 'center',
    vAlign: 'middle',
    fontSize: 14,
    fontWeight: null,
    fontStyle: '',
    fontVariant: '',
    fontFamily: 'Arial',
    lineHeight: 0,
    clip: true,
    columns: 1,
    columnGap: 0,
    lineBreak: true,
};
function drawText(ctx, input_Text, rc, drawStyle) {
    if (rc.width <= 0 || rc.height <= 0) {
        //width or height or font size cannot be 0
        return;
    }
    //console.time( 'drawtext' );
    drawStyle = { ...defStyle, ...drawStyle };
    ctx.save();
    if (drawStyle.clip) {
        ctx.beginPath();
        ctx.rect(rc.left, rc.top, rc.width, rc.height);
        ctx.clip();
    }
    if (drawStyle.rotation) {
        const center = new tools_1.Point(rc.left + rc.width / 2, rc.top + rc.height / 2);
        const rad = drawStyle.rotation / 180 * Math.PI;
        ctx.translate(center.x, center.y);
        ctx.rotate(rad);
        ctx.translate(-center.x, -center.y);
        //ctx.beginPath();
        //ctx.rect( rc.left, rc.top, rc.width, rc.height );
        //ctx.stroke( );
    }
    ctx.textBaseline = 'bottom';
    // End points
    let fontSize = (0, tools_1.roundTo)(drawStyle.fontSize, 2) ?? 12;
    //let style = `${drawStyle.fontStyle ?? ''} ${drawStyle.fontVariant ?? ''} ${drawStyle.fontWeight ?? ''} ${fontSize}px ${drawStyle.fontFamily ?? 'arial'}`;
    let style = '';
    if (drawStyle.fontStyle) {
        style += drawStyle.fontStyle + ' ';
    }
    if (drawStyle.fontVariant) {
        style += drawStyle.fontVariant + ' ';
    }
    if (drawStyle.fontWeight) {
        style += drawStyle.fontWeight + ' ';
    }
    style += fontSize + 'px ';
    let family = drawStyle.fontFamily ?? 'sans-serif';
    if (family.indexOf('.') > 0) {
        family = '"' + family + '"';
    }
    style += family;
    ctx.font = style.trim();
    let textarray = [];
    let lines = input_Text.split('\n');
    const columns = drawStyle.columns < 1 ? 1 : drawStyle.columns;
    const gap = drawStyle.columnGap;
    let col_width = (rc.width - gap * (columns - 1)) / columns;
    let col_left = rc.left;
    let hlimit = col_width;
    if (!drawStyle.lineBreak) {
        hlimit = 99999999;
    }
    const spaceW = _measureText(ctx, ' ');
    lines.forEach((text) => {
        let line = { width: 0, words: [], space: 0 };
        // fit in width ?
        let lwidth = _measureText(ctx, text);
        if (lwidth < hlimit) {
            line.width = lwidth;
            line.words.push({ width: lwidth, text });
            textarray.push(line);
        }
        // break line to fit in width
        else {
            // make word list & measure them
            let twords = text.split(/\s/).filter(w => w !== '');
            let words = twords.map(w => {
                const wwidth = _measureText(ctx, w);
                const word = {
                    width: wwidth,
                    text: w
                };
                return word;
            });
            // then compute lines 
            let n = 0;
            let e = 0;
            while (n < words.length) {
                const word = words[n];
                let test = line.width;
                if (test) {
                    test += spaceW;
                }
                test += word.width;
                //console.log( word, test, col_width );
                if (test > col_width && e > 0) {
                    textarray.push(line);
                    // restart
                    e = 0;
                    lwidth = 0;
                    line = { width: 0, words: [], space: 0 };
                }
                else {
                    line.words.push(word);
                    line.width = test;
                    n++;
                    e++;
                }
            }
            if (e) {
                textarray.push(line);
                line.last = true;
            }
        }
    });
    const textSize = _calcTextHeight(ctx, "Ag");
    let lineHeight = (drawStyle.lineHeight ?? 1.3) * textSize; // * 1.2 = map to pdf 
    const nlines = textarray.length;
    // calc vertical Align
    let col_top = rc.top;
    if (columns == 1) {
        let fullHeight = lineHeight * nlines;
        if (nlines == 1) {
            lineHeight = textSize;
            fullHeight = textSize;
        }
        if (drawStyle.vAlign === 'middle') {
            col_top = rc.top + rc.height / 2 - fullHeight / 2;
            col_top += lineHeight / 2;
            ctx.textBaseline = 'middle';
        }
        else if (drawStyle.vAlign === 'bottom') {
            if (fullHeight < rc.height) {
                col_top = rc.top + rc.height - fullHeight + lineHeight;
            }
        }
        else {
            col_top = rc.top;
            ctx.textBaseline = 'top';
        }
    }
    else {
        // always top, cannot justify multi-columns vertically
        // todo: for now
        col_top += textSize;
    }
    const justify = drawStyle.align == 'justify';
    let column = columns;
    let y = col_top;
    let align = 0;
    // faster test..
    switch (drawStyle.align) {
        case 'right':
            align = 1;
            break;
        case 'center':
            align = 2;
            break;
    }
    //print all lines of text
    let idx = 1, yy = 0;
    textarray.some(line => {
        //console.log( idx++, yy );
        line.space = spaceW;
        if (justify && !line.last) {
            _justify(line, col_width, spaceW);
        }
        let x = col_left;
        if (align == 1) {
            x += col_width - line.width;
        }
        else if (align == 2) {
            x += col_width / 2 - line.width / 2;
        }
        // ...debug
        /*ctx.lineWidth = 1;
        ctx.beginPath( );
        ctx.moveTo( rc.left, y );
        ctx.lineTo( rc.right, y );
        ctx.strokeStyle = 'white';
        ctx.stroke( );*/
        line.words.forEach(w => {
            /*ctx.beginPath( );
            ctx.moveTo( x, y );
            ctx.lineTo( x, y-40 );
            ctx.strokeStyle = 'red';
            ctx.stroke( );*/
            /*ctx.beginPath( );
            ctx.moveTo( x+w.width, y );
            ctx.lineTo( x+w.width, y-40 );
            ctx.strokeStyle = 'green';
            ctx.stroke( );*/
            ctx.fillText(w.text, x, y);
            x += w.width + line.space;
        });
        y += lineHeight;
        yy += lineHeight;
        if (y > (rc.bottom + lineHeight)) {
            y = col_top;
            col_left += col_width + gap;
            if (--column == 0) {
                return true;
            }
        }
    });
    ctx.restore();
    //console.timeEnd( 'drawtext' );
    // todo autogrow + multi-columns
    return { height: (textarray.length + 0.3) * lineHeight };
}
exports.drawText = drawText;
// Calculate Height of the font
function _calcTextHeight(ctx, text) {
    const size = ctx.measureText(text);
    return size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
}
function _measureText(ctx, text) {
    return (0, tools_1.roundTo)(ctx.measureText(text).width, 2);
}
function _justify(line, width, spaceW) {
    let delta = (width - line.width) / (line.words.length - 1) + spaceW;
    if (delta <= 0) {
        return;
    }
    line.width = width;
    line.space = delta;
}
