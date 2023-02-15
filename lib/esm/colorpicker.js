/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file colorpicker.ts
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
/**
 * ARGH this code is awfull
 */
import { Container, Component } from './component';
import { CheckBox } from './checkbox';
import { Dialog } from './dialog';
import { EvChange } from './x4events';
import { VLayout, HLayout } from './layout';
import { Label } from './label';
import { Color } from './color';
import { isString, getMousePos, clamp, classNames } from './tools';
import { TextEdit } from './textedit';
import { Menu, MenuItem } from './menu';
const pal_colors = {
    blue: [0x0e5a8a, 0x106ba3, 0x137cbd, 0x2b95d6, 0x48aff0,],
    green: [0x0a6640, 0x0d8050, 0x0f9960, 0x15b371, 0x3dcc91,],
    orange: [0xa66321, 0xbf7326, 0xd9822b, 0xf29d49, 0xffb366,],
    red: [0xa82a2a, 0xc23030, 0xdb3737, 0xf55656, 0xff7373,],
    vermilion: [0x9e2b0e, 0xb83211, 0xd13913, 0xeb532d, 0xff6e4a,],
    rose: [0xa82255, 0xc22762, 0xdb2c6f, 0xf5498b, 0xff66a1,],
    violet: [0x5c255c, 0x752f75, 0x8f398f, 0xa854a8, 0xc274c2,],
    indigo: [0x5642a6, 0x634dbf, 0x7157d9, 0x9179f2, 0xad99ff,],
    cobalt: [0x1f4b99, 0x2458b3, 0x2965cc, 0x4580e6, 0x669eff,],
    turquoise: [0x008075, 0x00998c, 0x00b3a4, 0x14ccbd, 0x2ee6d6,],
    forest: [0x1d7324, 0x238c2c, 0x29a634, 0x43bf4d, 0x62d96b,],
    lime: [0x728c23, 0x87a629, 0x9bbf30, 0xb6d94c, 0xd1f26d,],
    gold: [0xa67908, 0xbf8c0a, 0xd99e0b, 0xf2b824, 0xffc940,],
    sepia: [0x63411e, 0x7d5125, 0x96622d, 0xb07b46, 0xc99765,],
    bw: [0x000000, 0x444444, 0x666666, 0xcccccc, 0xffffff,],
};
export class ColorPicker extends Container {
    m_colorSel;
    m_colorHue;
    m_colorAlpha;
    m_sample;
    m_selMark;
    m_hueMark;
    m_alphaMark;
    m_baseHSV;
    m_baseColor;
    m_transpCk;
    m_colorEdit;
    m_palmode;
    static last_palmode = false;
    constructor(props) {
        super(props);
        this.m_palmode = ColorPicker.last_palmode;
        this.setDomEvent('contextmenu', (e) => this._showCtx(e));
    }
    _showCtx(e) {
        const menu = new Menu({
            items: [
                new MenuItem({
                    text: 'Palette', checked: this.m_palmode, click: () => {
                        this.m_palmode = !this.m_palmode;
                        ColorPicker.last_palmode = this.m_palmode;
                        this.update();
                    }
                })
            ]
        });
        let pt = getMousePos(e, true);
        menu.displayAt(pt.x, pt.y);
    }
    render(props) {
        this.m_baseColor = props.color;
        this.m_baseHSV = Color.toHSV(this.m_baseColor);
        if (this.m_palmode) {
            this.addClass("pal-mode");
            let selector = null;
            let cur = null;
            let main_sel = [];
            let sub_sel = [];
            const ccolor = this.m_baseColor.value();
            materialColors.forEach(mc => {
                const color = mc.variations[4].hex;
                let selected = color === ccolor;
                if (!selected) {
                    selected = mc.variations.some(c => {
                        const cc = new Color(c.hex).value();
                        if (cc === ccolor) {
                            return true;
                        }
                    });
                }
                let cls = classNames('clr-box xbox', { selected });
                let el = new Component({
                    cls,
                    style: { backgroundColor: new Color(color).toHex() },
                    data: { color, main: mc.variations }
                });
                if (selected) {
                    fillSubs(mc.variations);
                }
                main_sel.push(el);
            });
            function fillSubs(colors) {
                sub_sel = [];
                colors.forEach(mc => {
                    let clr = new Color(mc.hex);
                    const selected = clr.value() == ccolor;
                    let cls = classNames('hclr-box xbox', { selected });
                    let el = new Component({
                        cls,
                        style: { backgroundColor: clr.toHex(), color: Color.contrastColor(clr).toHex() },
                        data: { color: clr.value() },
                        content: clr.toHex()
                    });
                    sub_sel.push(el);
                    if (selected) {
                        cur = el;
                    }
                });
                if (selector) {
                    selector.itemWithId('vsel').setContent(sub_sel);
                }
            }
            selector = new VLayout({
                content: [
                    new HLayout({
                        id: 'hsel',
                        content: main_sel
                    }),
                    new VLayout({
                        id: 'vsel',
                        flex: 1,
                        content: sub_sel
                    })
                ]
            });
            /*
            let cur = null;
            const buildCol = ( colors: number[] ) => {
                
                const ccolor = this.m_baseColor.value();
                const els = colors.map( x => {
                    const selected = x==ccolor;

                    let cls = classNames( 'clr-box', { selected } );
                    let el = new Component( { cls, style: { backgroundColor: new Color(x).toHex() }, data: { color: x } } );

                    if( selected ) {
                        cur = el;
                    }
                    return el;
                });
                
                return new VLayout( {
                    cls: 'vcol',
                    content: els
                });
            }
            
            let rows = new HLayout( {
                cls: 'hcol',
                content: [
                        buildCol( pal_colors.blue ),
                        buildCol( pal_colors.green ),
                        buildCol( pal_colors.orange ),
                        buildCol( pal_colors.red ),
                        buildCol( pal_colors.vermilion ),
                        buildCol( pal_colors.rose ),
                        buildCol( pal_colors.violet ),
                        buildCol( pal_colors.indigo ),
                        buildCol( pal_colors.cobalt ),
                        buildCol( pal_colors.turquoise ),
                        buildCol( pal_colors.forest ),
                        buildCol( pal_colors.lime ),
                        buildCol( pal_colors.gold ),
                        buildCol( pal_colors.sepia ),
                        buildCol( pal_colors.bw ),
                ]
            });
            */
            this.m_colorEdit = new TextEdit({
                cls: 'hexv',
                value: '',
                attrs: {
                    spellcheck: false,
                },
                change: (ev) => {
                    const clr = new Color(ev.value);
                    if (clr) {
                        this.m_baseColor = clr;
                        this.m_baseHSV = Color.toHSV(clr);
                        this._updateColor(false);
                    }
                }
            });
            this.m_transpCk = new CheckBox({
                cls: 'transp',
                text: 'transparent',
                change: (ev) => {
                    this.m_baseHSV.a = ev.value ? 0 : 1;
                    this._updateColor();
                }
            });
            this.setContent([selector, this.m_transpCk, this.m_colorEdit]);
            // globally handle click
            selector.setDomEvent('click', (ev) => {
                if (cur) {
                    cur.removeClass('selected');
                    cur = null;
                }
                let cell = Component.getElement(ev.target, 'xbox');
                if (cell) {
                    const subs = cell.getData('main');
                    if (subs) {
                        fillSubs(subs);
                    }
                    else {
                        const clr = new Color(cell.getData('color'));
                        this.m_baseColor = clr;
                        this.m_baseHSV = Color.toHSV(clr);
                        this._updateColor();
                        cur = cell;
                        cell.addClass('selected');
                    }
                }
            });
        }
        else {
            this.removeClass("pal-mode");
            this.m_selMark = new Component({ cls: 'marker' });
            this.m_colorSel = new Component({
                cls: 'sel',
                content: [
                    new Component({ cls: '@fit light' }),
                    new Component({ cls: '@fit dark' }),
                    this.m_selMark,
                ]
            });
            this.m_hueMark = new Component({ cls: 'marker' });
            this.m_colorHue = new Component({
                cls: 'hue',
                content: [
                    this.m_hueMark
                ]
            });
            this.m_sample = new Component({ cls: 'sample' });
            if (props.hasAlpha) {
                this.addClass('with-alpha');
                this.m_alphaMark = new Component({ cls: 'marker' });
                this.m_colorAlpha = new Component({
                    cls: 'alpha',
                    content: [
                        new Component({ cls: 'bk @fit', ref: 'color' }),
                        this.m_alphaMark
                    ]
                });
            }
            else {
                this.removeClass('with-alpha');
                this.m_transpCk = new CheckBox({
                    cls: 'transp',
                    text: 'transparent',
                    change: (ev) => {
                        this.m_baseHSV.a = ev.value ? 0 : 1;
                        this._updateColor();
                    }
                });
            }
            this.m_colorEdit = new TextEdit({
                cls: 'hexv',
                value: '',
                attrs: {
                    spellcheck: false,
                },
                change: (ev) => {
                    const clr = new Color(ev.value);
                    if (clr) {
                        this.m_baseColor = clr;
                        this.m_baseHSV = Color.toHSV(clr);
                        this._updateColor(false);
                    }
                }
            });
            this.setContent([
                this.m_colorSel,
                this.m_colorHue,
                this.m_colorAlpha,
                this.m_transpCk,
                this.m_colorEdit,
                this.m_sample,
            ]);
            this.m_colorSel.setDomEvent('mousedown', (ev) => {
                Component.setCapture(this, (e) => this._selChange(e));
            });
            this.m_colorHue.setDomEvent('mousedown', (ev) => {
                Component.setCapture(this, (e) => this._hueChange(e));
            });
            if (props.hasAlpha) {
                this.m_colorAlpha.setDomEvent('mousedown', (ev) => {
                    Component.setCapture(this, (e) => this._alphaChange(e));
                });
            }
            this._updateColor();
        }
    }
    set color(clr) {
        this.m_baseColor = clr;
        this.m_baseHSV = Color.toHSV(this.m_baseColor);
        this._updateColor();
    }
    get color() {
        return this.m_baseColor;
    }
    _selChange(ev) {
        let pt = getMousePos(ev, true);
        console.log(pt);
        let rc = this.m_colorSel.getBoundingRect();
        if (!this.m_props.hasAlpha) {
            this.m_baseHSV.a = 1;
        }
        this.m_baseHSV.s = clamp((pt.x - rc.left) / rc.width, 0, 1);
        this.m_baseHSV.v = 1 - clamp((pt.y - rc.top) / rc.height, 0, 1);
        this._updateColor();
        if (ev.type == 'mouseup' || ev.type == 'touchend') {
            Component.releaseCapture();
        }
    }
    _hueChange(ev) {
        let pt = getMousePos(ev, true);
        let rc = this.m_colorHue.getBoundingRect();
        this.m_baseHSV.h = clamp((pt.y - rc.top) / rc.height, 0, 1);
        this._updateColor();
        if (ev.type == 'mouseup' || ev.type == 'touchend') {
            Component.releaseCapture();
        }
    }
    _alphaChange(ev) {
        let pt = getMousePos(ev, true);
        let rc = this.m_colorAlpha.getBoundingRect();
        this.m_baseHSV.a = clamp((pt.x - rc.left) / rc.width, 0, 1);
        this._updateColor();
        if (ev.type == 'mouseup' || ev.type == 'touchend') {
            Component.releaseCapture();
        }
    }
    _updateColor(edit = true) {
        let color;
        if (!this.m_palmode) {
            color = Color.fromHSV(this.m_baseHSV.h, 1, 1, 1);
            this.m_colorSel.setStyleValue('backgroundColor', color.toString());
            color = Color.fromHSV(this.m_baseHSV.h, this.m_baseHSV.s, this.m_baseHSV.v, 1);
            this.m_sample.setStyleValue('backgroundColor', color.toString());
            if (this.m_props.hasAlpha) {
                let gradient = `linear-gradient(to right, rgba(0,0,0,0) 0%, ${color.toString()} 100%)`;
                this.m_colorAlpha.itemWithRef('color').setStyleValue('backgroundImage', gradient);
            }
            this.m_selMark.setStyle({
                left: (this.m_baseHSV.s * 100) + '%',
                top: (100 - this.m_baseHSV.v * 100) + '%',
            });
            this.m_hueMark.setStyle({
                top: (this.m_baseHSV.h * 100) + '%',
            });
            if (this.m_props.hasAlpha) {
                this.m_alphaMark.setStyle({
                    left: (this.m_baseHSV.a * 100) + '%',
                });
            }
            else {
                this.m_transpCk.check = this.m_baseHSV.a == 0;
            }
        }
        else {
            this.m_transpCk.check = this.m_baseHSV.a == 0;
        }
        color = Color.fromHSV(this.m_baseHSV.h, this.m_baseHSV.s, this.m_baseHSV.v, this.m_baseHSV.a);
        this.m_baseColor = color;
        if (edit) {
            this.m_colorEdit.value = color.alpha() == 1 ? color.toHex() : color.toString(); //color.toHex();
        }
        this._change();
    }
    _change() {
        this.emit('change', EvChange(this.m_baseColor));
    }
}
export class ColorPickerBox extends Dialog {
    m_picker;
    constructor(props) {
        props.icon = undefined;
        props.buttons = undefined;
        super(props);
        this.mapPropEvents(props, 'change');
        this.m_picker = new ColorPicker({
            color: props.color,
            hasAlpha: props.hasAlpha,
            style: { padding: 8 },
            width: 250,
            height: 250,
        });
        let customs = this._makeCustoms(props.cust_colors);
        this.form.updateContent([
            new VLayout({
                content: [
                    this.m_picker,
                    customs
                ]
            })
        ], ['ok', 'cancel']);
        this.on('btnClick', (ev) => {
            if (ev.button == 'ok') {
                this.emit('change', EvChange(this.m_picker.color));
            }
        });
    }
    _makeCustoms(cc) {
        let custom = null;
        if (cc && cc.length > 0) {
            let els = [];
            for (let i = 0; i < cc.length; i += 8) {
                let lne = [];
                for (let j = 0; j < 8; j++) {
                    let idx = i + j, clr = cc[idx];
                    lne.push(new Label({
                        cls: 'cust-cc',
                        text: '',
                        flex: 1,
                        style: {
                            backgroundColor: clr ? clr.toString() : 'transparent'
                        },
                        tooltip: clr ? clr.toString() : undefined,
                        dom_events: {
                            click: () => {
                                if (clr) {
                                    this.m_picker.color = clr;
                                    this.emit('change', EvChange(clr));
                                    this.close();
                                }
                            }
                        }
                    }));
                }
                els.push(new HLayout({ cls: 'line', content: lne }));
            }
            custom = new VLayout({ cls: 'customs', content: els });
        }
        return custom;
    }
    set color(clr) {
        this.m_picker.color = clr;
    }
    get color() {
        return this.m_picker.color;
    }
    /**
     * display a messagebox
     */
    static show(props) {
        let msg;
        if (isString(props)) {
            msg = new ColorPickerBox({ color: new Color(props) });
        }
        else {
            msg = new ColorPickerBox(props);
        }
        msg.show();
        return msg;
    }
}
export class ColorPickerEditor extends HLayout {
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
    }
    render(props) {
        let color = props.color;
        let tcolor;
        if (this._isTransp(color)) {
            color = Color.NONE;
            tcolor = 'black';
        }
        else {
            tcolor = Color.contrastColor(color).toString();
        }
        this.setContent([
            props.label ? new Label({
                cls: 'label',
                text: props.label,
                flex: props.labelWidth < 0 ? -props.labelWidth : undefined,
                width: props.labelWidth >= 0 ? props.labelWidth : undefined,
            }) : null,
            new Component({
                flex: 1,
                content: [
                    new Label({
                        cls: 'alpha @fit',
                        text: ''
                    }),
                    new Label({
                        cls: 'value @fit',
                        text: props.displayValue === false ? '' : color.toHex(),
                        style: {
                            backgroundColor: color.toString(),
                            color: tcolor
                        },
                        dom_events: {
                            click: () => this._showPicker()
                        }
                    })
                ],
            })
        ]);
        if (props.displayValue === false) {
            this.setStyleValue('background-image', "url( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAEsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjEwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMTAiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSIxMCIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMTAiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLjAiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLjAiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgRGVzaWduZXIgMS45LjAiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0iciI/Pn8+b7YAAAGCaUNDUHNSR0IgSUVDNjE5NjYtMi4xAAAokXWRy0tCQRSHv7Qwyh5gRIsWEtZKwwyiNi2UXlAt1CCrjV5fgdrlXiOibdBWKIja9FrUX1DboHUQFEUQ7YLWRW0qbueqoESe4cz55jdzDjNnwBLOKFm93gvZXF4LTvid85EFp+0FK5204sURVXR1JjQepqZ93lNnxluPWav2uX+tOZ7QFahrFB5VVC0vPCk8vZZXTd4R7lDS0bjwmbBbkwsK35l6rMSvJqdK/G2yFg4GwNIu7ExVcayKlbSWFZaX48pmVpXyfcyX2BO5uZDEHvFudIJM4MfJFGMEGGKAEZmH8OCjX1bUyPcW82dZkVxFZpV1NJZJkSaPW9RVqZ6QmBQ9ISPDutn/v33Vk4O+UnW7HxqeDeO9F2zb8FMwjK8jw/g5BusTXOYq+SuHMPwheqGiuQ6gbRPOrypabBcutqDrUY1q0aJkFbckk/B2Ci0RcNxA02KpZ+V9Th4gvCFfdQ17+9An59uWfgF7Hmfv4QYbGAAAAAlwSFlzAAALEwAACxMBAJqcGAAAACdJREFUGJVjbGhoYEAC9fX1yFwmBryAptKM////R+Y3NjbSzW4C0gAo9QeQBmhTIwAAAABJRU5ErkJggg=='");
        }
        this._setTabIndex(props.tabIndex);
    }
    set value(color) {
        this.m_props.color = color;
        this.update();
    }
    get value() {
        return this.m_props.color;
    }
    set custom_colors(v) {
        this.m_props.cust_colors = v;
    }
    _showPicker() {
        let dlg = new ColorPickerBox({
            color: this.m_props.color,
            cust_colors: this.m_props.cust_colors,
            hasAlpha: this.m_props.hasAlpha,
            events: {
                change: (e) => {
                    this.m_props.color = e.value;
                    this._change();
                    this.update();
                }
            }
        });
        let rc = this.getBoundingRect();
        dlg.displayAt(rc.left, rc.bottom, 'tl');
    }
    _change() {
        this.emit('change', EvChange(this.m_props.color));
    }
    _isTransp(color) {
        return !color.alpha();
    }
}
// :: Material colors scheme ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const materialColors = [
    {
        color: "Red",
        variations: [
            {
                weight: 50,
                hex: 0xFFEBEE
            },
            {
                weight: 100,
                hex: 0xFFCDD2
            },
            {
                weight: 200,
                hex: 0xEF9A9A
            },
            {
                weight: 300,
                hex: 0xE57373
            },
            {
                weight: 400,
                hex: 0xEF5350
            },
            {
                weight: 500,
                hex: 0xF44336
            },
            {
                weight: 600,
                hex: 0xE53935
            },
            {
                weight: 700,
                hex: 0xD32F2F
            },
            {
                weight: 800,
                hex: 0xC62828
            },
            {
                weight: 900,
                hex: 0xB71C1C
            }
        ]
    },
    {
        color: "Pink",
        variations: [
            {
                weight: 50,
                hex: 0xFCE4EC
            },
            {
                weight: 100,
                hex: 0xF8BBD0
            },
            {
                weight: 200,
                hex: 0xF48FB1
            },
            {
                weight: 300,
                hex: 0xF06292
            },
            {
                weight: 400,
                hex: 0xEC407A
            },
            {
                weight: 500,
                hex: 0xE91E63
            },
            {
                weight: 600,
                hex: 0xD81B60
            },
            {
                weight: 700,
                hex: 0xC2185B
            },
            {
                weight: 800,
                hex: 0xAD1457
            },
            {
                weight: 900,
                hex: 0x880E4F
            }
        ]
    },
    {
        color: "Purple",
        variations: [
            {
                weight: 50,
                hex: 0xF3E5F5
            },
            {
                weight: 100,
                hex: 0xE1BEE7
            },
            {
                weight: 200,
                hex: 0xCE93D8
            },
            {
                weight: 300,
                hex: 0xBA68C8
            },
            {
                weight: 400,
                hex: 0xAB47BC
            },
            {
                weight: 500,
                hex: 0x9C27B0
            },
            {
                weight: 600,
                hex: 0x8E24AA
            },
            {
                weight: 700,
                hex: 0x7B1FA2
            },
            {
                weight: 800,
                hex: 0x6A1B9A
            },
            {
                weight: 900,
                hex: 0x4A148C
            }
        ]
    },
    {
        color: "Deep Purple",
        variations: [
            {
                weight: 50,
                hex: 0xEDE7F6
            },
            {
                weight: 100,
                hex: 0xD1C4E9
            },
            {
                weight: 200,
                hex: 0xB39DDB
            },
            {
                weight: 300,
                hex: 0x9575CD
            },
            {
                weight: 400,
                hex: 0x7E57C2
            },
            {
                weight: 500,
                hex: 0x673AB7
            },
            {
                weight: 600,
                hex: 0x5E35B1
            },
            {
                weight: 700,
                hex: 0x512DA8
            },
            {
                weight: 800,
                hex: 0x4527A0
            },
            {
                weight: 900,
                hex: 0x311B92
            }
        ]
    },
    {
        color: "Indigo",
        variations: [
            {
                weight: 50,
                hex: 0xE8EAF6
            },
            {
                weight: 100,
                hex: 0xC5CAE9
            },
            {
                weight: 200,
                hex: 0x9FA8DA
            },
            {
                weight: 300,
                hex: 0x7986CB
            },
            {
                weight: 400,
                hex: 0x5C6BC0
            },
            {
                weight: 500,
                hex: 0x3F51B5
            },
            {
                weight: 600,
                hex: 0x3949AB
            },
            {
                weight: 700,
                hex: 0x303F9F
            },
            {
                weight: 800,
                hex: 0x283593
            },
            {
                weight: 900,
                hex: 0x1A237E
            }
        ]
    },
    {
        color: "Blue",
        variations: [
            {
                weight: 50,
                hex: 0xE3F2FD
            },
            {
                weight: 100,
                hex: 0xBBDEFB
            },
            {
                weight: 200,
                hex: 0x90CAF9
            },
            {
                weight: 300,
                hex: 0x64B5F6
            },
            {
                weight: 400,
                hex: 0x42A5F5
            },
            {
                weight: 500,
                hex: 0x2196F3
            },
            {
                weight: 600,
                hex: 0x1E88E5
            },
            {
                weight: 700,
                hex: 0x1976D2
            },
            {
                weight: 800,
                hex: 0x1565C0
            },
            {
                weight: 900,
                hex: 0x0D47A1
            }
        ]
    },
    {
        color: "Light Blue",
        variations: [
            {
                weight: 50,
                hex: 0xE1F5FE
            },
            {
                weight: 100,
                hex: 0xB3E5FC
            },
            {
                weight: 200,
                hex: 0x81D4FA
            },
            {
                weight: 300,
                hex: 0x4FC3F7
            },
            {
                weight: 400,
                hex: 0x29B6F6
            },
            {
                weight: 500,
                hex: 0x03A9F4
            },
            {
                weight: 600,
                hex: 0x039BE5
            },
            {
                weight: 700,
                hex: 0x0288D1
            },
            {
                weight: 800,
                hex: 0x0277BD
            },
            {
                weight: 900,
                hex: 0x01579B
            }
        ]
    },
    {
        color: "Cyan",
        variations: [
            {
                weight: 50,
                hex: 0xE0F7FA
            },
            {
                weight: 100,
                hex: 0xB2EBF2
            },
            {
                weight: 200,
                hex: 0x80DEEA
            },
            {
                weight: 300,
                hex: 0x4DD0E1
            },
            {
                weight: 400,
                hex: 0x26C6DA
            },
            {
                weight: 500,
                hex: 0x00BCD4
            },
            {
                weight: 600,
                hex: 0x00ACC1
            },
            {
                weight: 700,
                hex: 0x0097A7
            },
            {
                weight: 800,
                hex: 0x00838F
            },
            {
                weight: 900,
                hex: 0x006064
            }
        ]
    },
    {
        color: "Teal",
        variations: [
            {
                weight: 50,
                hex: 0xE0F2F1
            },
            {
                weight: 100,
                hex: 0xB2DFDB
            },
            {
                weight: 200,
                hex: 0x80CBC4
            },
            {
                weight: 300,
                hex: 0x4DB6AC
            },
            {
                weight: 400,
                hex: 0x26A69A
            },
            {
                weight: 500,
                hex: 0x009688
            },
            {
                weight: 600,
                hex: 0x00897B
            },
            {
                weight: 700,
                hex: 0x00796B
            },
            {
                weight: 800,
                hex: 0x00695C
            },
            {
                weight: 900,
                hex: 0x004D40
            }
        ]
    },
    {
        color: "Green",
        variations: [
            {
                weight: 50,
                hex: 0xE8F5E9
            },
            {
                weight: 100,
                hex: 0xC8E6C9
            },
            {
                weight: 200,
                hex: 0xA5D6A7
            },
            {
                weight: 300,
                hex: 0x81C784
            },
            {
                weight: 400,
                hex: 0x66BB6A
            },
            {
                weight: 500,
                hex: 0x4CAF50
            },
            {
                weight: 600,
                hex: 0x43A047
            },
            {
                weight: 700,
                hex: 0x388E3C
            },
            {
                weight: 800,
                hex: 0x2E7D32
            },
            {
                weight: 900,
                hex: 0x1B5E20
            }
        ]
    },
    {
        color: "Light Green",
        variations: [
            {
                weight: 50,
                hex: 0xF1F8E9
            },
            {
                weight: 100,
                hex: 0xDCEDC8
            },
            {
                weight: 200,
                hex: 0xC5E1A5
            },
            {
                weight: 300,
                hex: 0xAED581
            },
            {
                weight: 400,
                hex: 0x9CCC65
            },
            {
                weight: 500,
                hex: 0x8BC34A
            },
            {
                weight: 600,
                hex: 0x7CB342
            },
            {
                weight: 700,
                hex: 0x689F38
            },
            {
                weight: 800,
                hex: 0x558B2F
            },
            {
                weight: 900,
                hex: 0x33691E
            }
        ]
    },
    {
        color: "Lime",
        variations: [
            {
                weight: 50,
                hex: 0xF9FBE7
            },
            {
                weight: 100,
                hex: 0xF0F4C3
            },
            {
                weight: 200,
                hex: 0xE6EE9C
            },
            {
                weight: 300,
                hex: 0xDCE775
            },
            {
                weight: 400,
                hex: 0xD4E157
            },
            {
                weight: 500,
                hex: 0xCDDC39
            },
            {
                weight: 600,
                hex: 0xC0CA33
            },
            {
                weight: 700,
                hex: 0xAFB42B
            },
            {
                weight: 800,
                hex: 0x9E9D24
            },
            {
                weight: 900,
                hex: 0x827717
            }
        ]
    },
    {
        color: "Yellow",
        variations: [
            {
                weight: 50,
                hex: 0xFFFDE7
            },
            {
                weight: 100,
                hex: 0xFFF9C4
            },
            {
                weight: 200,
                hex: 0xFFF59D
            },
            {
                weight: 300,
                hex: 0xFFF176
            },
            {
                weight: 400,
                hex: 0xFFEE58
            },
            {
                weight: 500,
                hex: 0xFFEB3B
            },
            {
                weight: 600,
                hex: 0xFDD835
            },
            {
                weight: 700,
                hex: 0xFBC02D
            },
            {
                weight: 800,
                hex: 0xF9A825
            },
            {
                weight: 900,
                hex: 0xF57F17
            }
        ]
    },
    {
        color: "Amber",
        variations: [
            {
                weight: 50,
                hex: 0xFFF8E1
            },
            {
                weight: 100,
                hex: 0xFFECB3
            },
            {
                weight: 200,
                hex: 0xFFE082
            },
            {
                weight: 300,
                hex: 0xFFD54F
            },
            {
                weight: 400,
                hex: 0xFFCA28
            },
            {
                weight: 500,
                hex: 0xFFC107
            },
            {
                weight: 600,
                hex: 0xFFB300
            },
            {
                weight: 700,
                hex: 0xFFA000
            },
            {
                weight: 800,
                hex: 0xFF8F00
            },
            {
                weight: 900,
                hex: 0xFF6F00
            }
        ]
    },
    {
        color: "Orange",
        variations: [
            {
                weight: 50,
                hex: 0xFFF3E0
            },
            {
                weight: 100,
                hex: 0xFFE0B2
            },
            {
                weight: 200,
                hex: 0xFFCC80
            },
            {
                weight: 300,
                hex: 0xFFB74D
            },
            {
                weight: 400,
                hex: 0xFFA726
            },
            {
                weight: 500,
                hex: 0xFF9800
            },
            {
                weight: 600,
                hex: 0xFB8C00
            },
            {
                weight: 700,
                hex: 0xF57C00
            },
            {
                weight: 800,
                hex: 0xEF6C00
            },
            {
                weight: 900,
                hex: 0xE65100
            }
        ]
    },
    {
        color: "Deep Orange",
        variations: [
            {
                weight: 50,
                hex: 0xFBE9E7
            },
            {
                weight: 100,
                hex: 0xFFCCBC
            },
            {
                weight: 200,
                hex: 0xFFAB91
            },
            {
                weight: 300,
                hex: 0xFF8A65
            },
            {
                weight: 400,
                hex: 0xFF7043
            },
            {
                weight: 500,
                hex: 0xFF5722
            },
            {
                weight: 600,
                hex: 0xF4511E
            },
            {
                weight: 700,
                hex: 0xE64A19
            },
            {
                weight: 800,
                hex: 0xD84315
            },
            {
                weight: 900,
                hex: 0xBF360C
            }
        ]
    },
    {
        color: "Brown",
        variations: [
            {
                weight: 50,
                hex: 0xEFEBE9
            },
            {
                weight: 100,
                hex: 0xD7CCC8
            },
            {
                weight: 200,
                hex: 0xBCAAA4
            },
            {
                weight: 300,
                hex: 0xA1887F
            },
            {
                weight: 400,
                hex: 0x8D6E63
            },
            {
                weight: 500,
                hex: 0x795548
            },
            {
                weight: 600,
                hex: 0x6D4C41
            },
            {
                weight: 700,
                hex: 0x5D4037
            },
            {
                weight: 800,
                hex: 0x4E342E
            },
            {
                weight: 900,
                hex: 0x3E2723
            }
        ]
    },
    {
        color: "Grey",
        variations: [
            {
                weight: 50,
                hex: 0xFAFAFA
            },
            {
                weight: 100,
                hex: 0xF5F5F5
            },
            {
                weight: 200,
                hex: 0xEEEEEE
            },
            {
                weight: 300,
                hex: 0xE0E0E0
            },
            {
                weight: 400,
                hex: 0xBDBDBD
            },
            {
                weight: 500,
                hex: 0x9E9E9E
            },
            {
                weight: 600,
                hex: 0x757575
            },
            {
                weight: 700,
                hex: 0x616161
            },
            {
                weight: 800,
                hex: 0x424242
            },
            {
                weight: 900,
                hex: 0x212121
            }
        ]
    },
    {
        color: "Blue Grey",
        variations: [
            {
                weight: 50,
                hex: 0xECEFF1
            },
            {
                weight: 100,
                hex: 0xCFD8DC
            },
            {
                weight: 200,
                hex: 0xB0BEC5
            },
            {
                weight: 300,
                hex: 0x90A4AE
            },
            {
                weight: 400,
                hex: 0x78909C
            },
            {
                weight: 500,
                hex: 0x607D8B
            },
            {
                weight: 600,
                hex: 0x546E7A
            },
            {
                weight: 700,
                hex: 0x455A64
            },
            {
                weight: 800,
                hex: 0x37474F
            },
            {
                weight: 900,
                hex: 0x263238
            }
        ]
    },
    {
        color: "Grey",
        variations: [
            {
                weight: 50,
                hex: 0xFFFFFF
            },
            {
                weight: 100,
                hex: 0xe0e0e0
            },
            {
                weight: 200,
                hex: 0xc4c4c4
            },
            {
                weight: 300,
                hex: 0xa8a8a8
            },
            {
                weight: 400,
                hex: 0x8c8c8c
            },
            {
                weight: 500,
                hex: 0x707070
            },
            {
                weight: 600,
                hex: 0x545454
            },
            {
                weight: 700,
                hex: 0x383838
            },
            {
                weight: 800,
                hex: 0x1c1c1c
            },
            {
                weight: 900,
                hex: 0x00000
            }
        ]
    }
];
