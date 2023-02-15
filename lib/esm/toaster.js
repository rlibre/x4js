/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file toaster.ts
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
import { Label } from "./label";
import { Popup } from './popup';
export class Toaster extends Popup {
    m_message;
    m_icon;
    constructor(props) {
        super(props);
        this.m_message = props.message;
        this.m_icon = props.icon;
        this.enableMask(false);
        this.addClass('@non-maskable');
    }
    /** @ignore */
    render() {
        this.addClass('@hlayout');
        this.setContent([
            new Label({ icon: this.m_icon, text: this.m_message })
        ]);
    }
    show() {
        this.show = super.show;
        this.displayAt(9999, 9999, 'br', { x: 0, y: -24 });
        let opacity = 1.0;
        this.startTimer('fadeout', 2000, false, () => {
            this.startTimer('opacity', 100, true, () => {
                this.setStyleValue('opacity', opacity);
                opacity -= 0.1;
                if (opacity < 0) {
                    this.dispose();
                }
            });
        });
    }
}
