/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file label.ts
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
import { Component } from './component';
import { escapeHtml, HtmlString } from './tools';
import { Icon } from './icon';
/**
 * Standard label
 */
export class Label extends Component {
    constructor(param) {
        if (typeof (param) === 'string' || param instanceof HtmlString) {
            super({ text: param });
        }
        else {
            super(param);
        }
    }
    /** @ignore */
    render(props) {
        let text = this.m_props.text;
        if (this.m_props.multiline && !(text instanceof HtmlString)) {
            text = new HtmlString(escapeHtml(text, true));
        }
        if (!props.icon) {
            this.setContent(text);
        }
        else {
            this.setTag('span');
            this.addClass('@hlayout');
            this.setContent([
                new Icon({ icon: props.icon }),
                new Component({ content: text, ref: 'text' })
            ]);
        }
        this.addClass(props.align ?? 'left');
    }
    /**
     * change the displayed text
     * @param text - new text
     */
    set text(txt) {
        let props = this.m_props;
        if (props.text !== txt) {
            props.text = txt;
            let text = this.m_props.text;
            if (this.m_props.multiline && !(text instanceof HtmlString)) {
                text = new HtmlString(escapeHtml(text, true));
            }
            if (this.dom) {
                let comp = this;
                if (this.m_props.icon) {
                    comp = this.itemWithRef('text');
                }
                comp.setContent(text);
            }
        }
    }
    /**
     *
     */
    get text() {
        return this.m_props.text;
    }
}
