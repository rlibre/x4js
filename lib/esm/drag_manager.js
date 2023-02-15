/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file drag_manager.ts
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
import { x4document } from './x4dom';
const x_drag_cb = Symbol('x-drag-cb');
/**
 *
 */
class DragManager {
    dragSource;
    dragGhost;
    dropTarget;
    notified;
    timer;
    /**
     *
     */
    registerDraggableElement(el) {
        el.setDomEvent('dragstart', (ev) => {
            this.dragSource = el;
            this.dragGhost = el.dom.cloneNode(true);
            this.dragGhost.classList.add('dragged');
            x4document.body.appendChild(this.dragGhost);
            el.addClass('dragging');
            ev.dataTransfer.setData('text/string', '1');
            ev.dataTransfer.setDragImage(new Image(), 0, 0);
            ev.stopPropagation();
        });
        el.setDomEvent('drag', (ev) => {
            this.dragGhost.style.left = ev.pageX + "px";
            this.dragGhost.style.top = ev.pageY + "px";
        });
        el.setDomEvent('dragend', (ev) => {
            el.removeClass('dragging');
            this.dragGhost.remove();
        });
        el.setAttribute('draggable', "true");
    }
    /**
     *
     */
    registerDropTarget(el, cb, filterCB) {
        const dragEnter = (ev) => {
            if (!filterCB(this.dragSource)) {
                console.log('reject ', el);
                ev.dataTransfer.dropEffect = 'none';
                return;
            }
            console.log('accepted ', el);
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
        };
        const dragOver = (ev) => {
            //console.log( "dragover", ev.target );
            if (!filterCB(this.dragSource)) {
                console.log('reject ', el);
                ev.dataTransfer.dropEffect = 'none';
                return;
            }
            ev.preventDefault();
            if (this.dropTarget != el) {
                this.dropTarget = el;
                this._startCheck();
            }
            if (this.dropTarget) {
                cb('drag', this.dragSource, { x: ev.pageX, y: ev.pageY });
            }
            ev.dataTransfer.dropEffect = 'copy';
        };
        const dragLeave = (ev) => {
            //console.log( "dragleave", ev.target );
            this.dropTarget = null;
            ev.preventDefault();
        };
        const drop = (ev) => {
            cb('drop', this.dragSource, { x: ev.pageX, y: ev.pageY });
            this.dropTarget = null;
            el.removeClass('drop-over');
        };
        el.setDomEvent('dragenter', dragEnter);
        el.setDomEvent('dragover', dragOver);
        el.setDomEvent('dragleave', dragLeave);
        el.setDomEvent('drop', drop);
        el.setData(x_drag_cb, cb);
    }
    _startCheck() {
        if (this.timer) {
            clearInterval(this.timer);
            this._check();
        }
        this.timer = setInterval(() => this._check(), 300);
    }
    _check() {
        const leaving = (x) => {
            x.removeClass('drop-over');
            const cb = x.getData(x_drag_cb);
            cb('leave', this.dragSource);
        };
        const entering = (x) => {
            x.addClass('drop-over');
            const cb = x.getData(x_drag_cb);
            cb('enter', this.dragSource);
        };
        if (this.dropTarget) {
            if (!this.notified || this.notified != this.dropTarget) {
                if (this.notified) {
                    leaving(this.notified);
                }
                this.notified = this.dropTarget;
                entering(this.notified);
            }
        }
        else {
            if (this.notified) {
                leaving(this.notified);
                this.notified = null;
                clearInterval(this.timer);
            }
        }
    }
}
export const dragManager = new DragManager();
