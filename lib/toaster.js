"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file toaster.ts
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
exports.Toaster = void 0;
const label_1 = require("./label");
const popup_1 = require("./popup");
class Toaster extends popup_1.Popup {
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
            new label_1.Label({ icon: this.m_icon, text: this.m_message })
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
exports.Toaster = Toaster;
