"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file texthiliter.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextHiliter = void 0;
/**
 * idea came from https://www.cdolivet.com/editarea
 */
const component_1 = require("./component");
class TextHiliter extends component_1.Component {
    m_text;
    m_ed;
    m_hi;
    m_top;
    m_kwList;
    constructor(props) {
        super(props);
        this.m_kwList = props.kwList;
        this.m_top = 0;
        this.m_text = props.text ?? '';
        this.mapPropEvents(props, 'change');
    }
    /** @ignore */
    render() {
        this.setContent([
            this.m_hi = new component_1.Component({
                tag: 'span',
                cls: '@fit @syntax-hiliter',
            }),
            this.m_ed = new component_1.Component({
                tag: 'textarea',
                cls: '@fit',
                width: '100%',
                attrs: {
                    spellcheck: 'false',
                    wrap: 'off',
                },
                dom_events: {
                    input: () => this._hiliteText(),
                    scroll: () => this._updateScroll(),
                    keydown: (e) => this._keydown(e),
                }
            }),
        ]);
    }
    componentCreated() {
        super.componentCreated();
        this.value = this.m_text;
    }
    get value() {
        if (this.dom) {
            return this.m_ed.dom.value;
        }
        else {
            return this.m_text;
        }
    }
    set value(t) {
        if (this.dom) {
            this.m_ed.dom.value = t;
        }
        this.m_text = t;
        this._hiliteText();
    }
    _keydown(e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            let dom = this.m_ed.dom;
            let ss = dom.selectionStart;
            let se = dom.selectionEnd;
            dom.setRangeText('\t', ss, se);
            dom.setSelectionRange(ss + 1, ss + 1);
            dom.dispatchEvent(new Event('input'));
        }
        else if (e.key == 'Enter') {
            e.stopPropagation();
        }
    }
    _hiliteText() {
        let text = this.m_ed.dom.value;
        if (!this.m_hi.dom.firstChild) {
            this.m_hi.dom.innerHTML = '<div style="position:absolute"></div>';
        }
        this.m_hi.dom.firstChild.innerHTML = this._tokenize(text);
        //	this._updateScroll( );
    }
    _updateScroll() {
        this.startTimer('sync', 0, false, () => {
            let top = this.m_ed.dom.scrollTop;
            if (top != this.m_top) {
                this.m_hi.dom.scrollTop = top;
                this.m_top = top;
            }
            this.m_hi.dom.scrollLeft = this.m_ed.dom.scrollLeft;
            //this.m_hi.setStyleValue( 'width', this.m_ed.dom.clientWidth );
        });
    }
    _escape(text) {
        text = text.replace(/&/gm, '&amp;');
        text = text.replace(/</gm, '&lt;');
        text = text.replace(/>/gm, '&gt;');
        return text;
    }
    _tokenize(text) {
        const reNUM = /\d/;
        const reNUM2 = /[\d.]/;
        const rePUNC = /\+|-|,|\/|\*|=|%|!|\||;|\.|\[|\]|\{|\|\(|\)|}|<|>|&/;
        const reKW = /[a-zA-Z_]/;
        const reKW2 = /[a-zA-Z0-9_]/;
        let result = '';
        let i = 0;
        let length = text.length;
        let s;
        console.time("hilite");
        while (i < length) {
            let c = text.charAt(i);
            // numbers
            if (reNUM.test(c)) {
                let s = i;
                do {
                    c = text.charAt(++i);
                } while (reNUM2.test(c) && i < length);
                result += '<span class="num">' + text.substring(s, i) + '</span>';
                continue;
            }
            // keywords
            if (this.m_kwList) {
                if (reKW.test(c)) {
                    let s = i;
                    do {
                        c = text.charAt(++i);
                    } while (reKW2.test(c) && i < length);
                    let kw = text.substring(s, i);
                    if (this.m_kwList.has(kw)) {
                        result += '<span class="kword">' + kw + '</span>';
                    }
                    else {
                        result += kw;
                    }
                    continue;
                }
            }
            if (c == '#') {
                let ne = text.indexOf('\n', i + 1);
                if (ne < 0) {
                    ne = text.length;
                }
                result += '<span class="cmt">' + this._escape(text.substring(i, ne)) + '</span>';
                i = ne;
                continue;
            }
            //	comments
            if (c == '/') {
                let cn = text.charAt(i + 1);
                if (cn == '*') {
                    let ne = text.indexOf('*/', i + 2);
                    if (ne < 0) {
                        ne = text.length;
                    }
                    result += '<span class="cmt">' + this._escape(text.substring(i, ne + 2)) + '</span>';
                    i = ne + 2;
                    continue;
                }
                else if (cn == '/') {
                    let ne = text.indexOf('\n', i + 2);
                    if (ne < 0) {
                        ne = text.length;
                    }
                    result += `<span class="cmt">${this._escape(text.substring(i, ne))}</span>`;
                    i = ne;
                    continue;
                }
            }
            // punctuation
            if (rePUNC.test(c)) {
                s = i;
                do {
                    c = text.charAt(++i);
                } while (rePUNC.test(c) && i < length);
                result += `<span class="punc">${text.substring(s, i)}</span>`;
                continue;
            }
            // strings
            if (c == '"' || c == '\'' || c == '\`') {
                s = i;
                let delim = c;
                do {
                    c = text.charAt(++i);
                } while (c != delim && i < length);
                result += `<span class="str">${this._escape(text.substring(s, ++i))}</span>`;
                continue;
            }
            i++;
            result += c;
        }
        console.timeEnd("hilite");
        return result + '\n\n\n';
    }
}
exports.TextHiliter = TextHiliter;
