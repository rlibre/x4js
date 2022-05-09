"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file canvas.ts
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
exports.Canvas = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
function EvPaint(ctx) {
    return (0, x4_events_1.BasicEvent)({ ctx });
}
function mkPainter(c2d, w, h) {
    let cp = c2d;
    cp.width = w;
    cp.height = h;
    cp.smoothLine = smoothLine;
    cp.smoothLineEx = smoothLineEx;
    cp.line = line;
    cp.roundRect = roundRect;
    cp.calcTextSize = calcTextSize;
    cp.setFontSize = setFontSize;
    cp.circle = circle;
    return cp;
}
function smoothLine(points, path = null, move = true) {
    if (points.length < 2) {
        return;
    }
    if (!path) {
        path = this;
    }
    if (points.length == 2) {
        if (move !== false) {
            path.moveTo(points[0].x, points[0].y);
        }
        else {
            path.lineTo(points[0].x, points[0].y);
        }
        path.lineTo(points[1].x, points[1].y);
        return;
    }
    function midPointBtw(p1, p2) {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2
        };
    }
    function getQuadraticXY(t, sx, sy, cp1x, cp1y, ex, ey) {
        return {
            x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
            y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
        };
    }
    let p1 = points[0], p2 = points[1], p3 = p1;
    path.moveTo(p1.x, p1.y);
    for (let i = 1, len = points.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        let midPoint = midPointBtw(p1, p2);
        //this.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        for (let i = 0; i < 8; i++) {
            let { x, y } = getQuadraticXY(i / 8, p3.x, p3.y, p1.x, p1.y, midPoint.x, midPoint.y);
            path.lineTo(x, y);
        }
        p1 = points[i];
        p2 = points[i + 1];
        p3 = midPoint;
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    path.lineTo(p1.x, p1.y);
}
function smoothLineEx(_points, tension = 0.5, numOfSeg = 10, path = null, move = true, close = false) {
    let points = [];
    //pts = points.slice(0);
    for (let p = 0, pc = _points.length; p < pc; p++) {
        points.push(_points[p].x);
        points.push(_points[p].y);
    }
    let pts, i = 1, l = points.length, rPos = 0, rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0), res = new Float32Array(rLen), cache = new Float32Array((numOfSeg + 2) * 4), cachePtr = 4;
    pts = points.slice(0);
    if (close) {
        pts.unshift(points[l - 1]); // insert end point as first point
        pts.unshift(points[l - 2]);
        pts.push(points[0], points[1]); // first point as last point
    }
    else {
        pts.unshift(points[1]); // copy 1. point and insert at beginning
        pts.unshift(points[0]);
        pts.push(points[l - 2], points[l - 1]); // duplicate end-points
    }
    // cache inner-loop calculations as they are based on t alone
    cache[0] = 1; // 1,0,0,0
    for (; i < numOfSeg; i++) {
        var st = i / numOfSeg, st2 = st * st, st3 = st2 * st, st23 = st3 * 2, st32 = st2 * 3;
        cache[cachePtr++] = st23 - st32 + 1; // c1
        cache[cachePtr++] = st32 - st23; // c2
        cache[cachePtr++] = st3 - 2 * st2 + st; // c3
        cache[cachePtr++] = st3 - st2; // c4
    }
    cache[cachePtr] = 1; // 0,1,0,0
    // calc. points
    parse(pts, cache, l);
    if (close) {
        //l = points.length;
        pts = [];
        pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]); // second last and last
        pts.push(points[0], points[1], points[2], points[3]); // first and second
        parse(pts, cache, 4);
    }
    function parse(pts, cache, l) {
        for (var i = 2, t; i < l; i += 2) {
            var pt1 = pts[i], pt2 = pts[i + 1], pt3 = pts[i + 2], pt4 = pts[i + 3], t1x = (pt3 - pts[i - 2]) * tension, t1y = (pt4 - pts[i - 1]) * tension, t2x = (pts[i + 4] - pt1) * tension, t2y = (pts[i + 5] - pt2) * tension;
            for (t = 0; t < numOfSeg; t++) {
                var c = t << 2, //t * 4;
                c1 = cache[c], c2 = cache[c + 1], c3 = cache[c + 2], c4 = cache[c + 3];
                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
            }
        }
    }
    // add last point
    l = close ? 0 : points.length - 2;
    res[rPos++] = points[l];
    res[rPos] = points[l + 1];
    if (!path) {
        path = this;
    }
    // add lines to path
    for (let i = 0, l = res.length; i < l; i += 2) {
        if (i == 0 && move !== false) {
            path.moveTo(res[i], res[i + 1]);
        }
        else {
            path.lineTo(res[i], res[i + 1]);
        }
    }
}
function line(x1, y1, x2, y2, color, lineWidth = 1) {
    this.save();
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.lineWidth = lineWidth;
    this.strokeStyle = color;
    this.stroke();
    this.restore();
}
function roundRect(x, y, width, height, radius) {
    //this.beginPath( );
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
}
function calcTextSize(text, rounded = false) {
    let fh = this.measureText(text);
    let lh = fh.fontBoundingBoxAscent + fh.fontBoundingBoxDescent;
    if (rounded) {
        return { width: Math.round(fh.width), height: Math.round(lh) };
    }
    else {
        return { width: fh.width, height: lh };
    }
}
function setFontSize(fs) {
    let fsize = Math.round(fs) + 'px';
    this.font = this.font.replace(/\d+px/, fsize);
}
function circle(x, y, radius) {
    this.moveTo(x + radius, y);
    this.arc(x, y, radius, 0, Math.PI * 2);
}
/**
 *
 */
//export class CanvasProps extends CProps
//{
// low level handlers
//mousedown?:  (ev: MouseEvent) => any;
//mousemove?:  (ev: MouseEvent) => any;
//mouseup?:  (ev: MouseEvent) => any;
//mouseleave?:  (ev: MouseEvent) => any;
//mousewheel?: (ev: WheelEvent) => any;
//click?: (ev: MouseEvent) => any;
//dblclick?: (ev: MouseEvent) => any;
//touchstart?: (ev: TouchEvent) => any;
//touchmove?: (ev: TouchEvent) => any;
//touchend?: (ev: TouchEvent) => any;
//keydown?: (ev: KeyboardEvent) => any;
//keyup?: (ev: KeyboardEvent) => any;
//}
/**
 * Standard Canvas
 */
class Canvas extends component_1.Component {
    m_iwidth = -1;
    m_iheight = -1;
    m_scale = 1.0;
    m_canvas;
    constructor(props) {
        super(props);
        //if( props.mousedown )	{ this.setDomEvent( 'mousedown', props.mousedown ); }
        //if( props.mousemove )	{ this.setDomEvent( 'mousemove', props.mousemove ); }
        //if( props.mouseup )		{ this.setDomEvent( 'mouseup', props.mouseup ); }
        //if( props.mousewheel )	{ this.setDomEvent( 'wheel', props.mousewheel ); }
        //if( props.mouseleave )	{ this.setDomEvent( 'mouseleave', props.mouseleave ); }
        //if( props.click )		{ this.setDomEvent( 'click', props.click ); }
        //if( props.dblclick )	{ this.setDomEvent( 'dblclick', props.dblclick ); }
        //if( props.touchstart )	{ this.setDomEvent( 'touchstart', props.touchstart ); }
        //if( props.touchmove )	{ this.setDomEvent( 'touchmove', props.touchmove ); }
        //if( props.touchend )	{ this.setDomEvent( 'touchend', props.touchend ); }
        //if( props.keydown )		{ this.setDomEvent( 'keydown', props.keydown ); this.setAttribute( 'tabindex', 0 ); }
        //if( props.keyup )		{ this.setDomEvent( 'keyup', props.keyup ); this.setAttribute( 'tabindex', 0 ); }
        //if( props.paint ) 		{ this.onPaint( props.paint ); }
        this.setDomEvent('sizechange', () => { this._paint(); });
        this.mapPropEvents(props, 'paint');
    }
    /** @ignore */
    render() {
        this.m_iwidth = -1;
        this.m_iheight = -1;
        this.m_canvas = new component_1.Component({
            tag: 'canvas'
        });
        this.setContent(this.m_canvas);
        //		this.redraw(10);
    }
    update(delay = 0) {
        this.m_iheight = this.m_iwidth = -1;
        super.update(delay);
    }
    /**
     * scale the whole canvas
     */
    scale(scale) {
        this.m_scale = scale;
        this.m_iwidth = -1; // force recalc
        this.redraw();
    }
    /**
     * return the internal canvas
     */
    get canvas() {
        return this.m_canvas;
    }
    /**
     * redraw the canvas (force a paint)
     */
    $update_rep = 0;
    redraw(wait) {
        if (wait !== undefined) {
            if (++this.$update_rep >= 20) {
                this.stopTimer('update');
                this._paint();
            }
            else {
                this.startTimer('update', wait, false, () => this._paint());
            }
        }
        else {
            this.stopTimer('update');
            this._paint();
        }
    }
    /**
     *
     */
    _paint() {
        this.$update_rep = 0;
        let dom = this.dom;
        if (!this.isUserVisible()) {
            return;
        }
        let canvas = this.m_canvas.dom, w = dom.clientWidth, h = dom.clientHeight;
        let ctx = canvas.getContext('2d');
        if (w != this.m_iwidth || h != this.m_iheight) {
            // adjustment for HDPI
            let devicePixelRatio = window.devicePixelRatio || 1;
            let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            let canvas = this.canvas;
            if (devicePixelRatio !== backingStoreRatio || this.m_scale != 1.0) {
                let ratio = devicePixelRatio / backingStoreRatio, rw = w * ratio, rh = h * ratio;
                canvas.setAttribute('width', '' + rw);
                canvas.setAttribute('height', '' + rh);
                canvas.setStyleValue('width', w);
                canvas.setStyleValue('height', h);
                ratio *= this.m_scale;
                ctx.scale(ratio, ratio);
            }
            else {
                canvas.setAttribute('width', '' + w);
                canvas.setAttribute('height', '' + h);
                canvas.setStyleValue('width', w);
                canvas.setStyleValue('height', h);
                ctx.scale(1, 1);
            }
            this.m_iwidth = w;
            this.m_iheight = h;
        }
        if (w && h) {
            let cc = mkPainter(ctx, w, h);
            if (this.m_props.autoClear) {
                cc.clearRect(0, 0, w, h);
            }
            cc.save();
            cc.translate(-0.5, -0.5);
            this.paint(cc);
            cc.restore();
        }
    }
    paint(ctx) {
        try {
            if (this.m_props.painter) {
                this.m_props.painter(ctx);
            }
            else {
                this.emit('paint', EvPaint(ctx));
            }
        }
        catch (x) {
            console.assert(false, x);
        }
    }
}
exports.Canvas = Canvas;
