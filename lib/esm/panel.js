/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file panel.ts
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
import { VLayout, HLayout } from './layout';
import { Label } from './label';
import { Icon } from './icon';
export class Panel extends VLayout {
    m_ui_title;
    m_ui_body;
    constructor(props) {
        super(props);
        const sens = props?.sens == 'horizontal' ? '@hlayout' : '@vlayout';
        //todo: cannot be called twice do to content overload
        this.m_ui_title = new Label({ cls: 'title', text: this.m_props.title });
        this.m_ui_body = new Component({ cls: 'body ' + sens, content: this.m_props.content, style: props.bodyStyle });
    }
    /** @ignore */
    render() {
        const gadgets = this.m_props.gadgets ?? [];
        const icon = this.m_props.icon ? new Icon({ icon: this.m_props.icon }) : null;
        super.setContent([
            new HLayout({
                cls: 'title',
                content: [
                    icon,
                    this.m_ui_title,
                    ...gadgets
                ]
            }),
            this.m_ui_body
        ]);
    }
    setContent(els) {
        this.m_ui_body.setContent(els);
    }
    set title(text) {
        this.m_ui_title.text = text;
    }
}
