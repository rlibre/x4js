/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file button.ts
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
import { Component, CProps, CEventMap, HtmlString } from './component';
import { EventCallback, EvClick, EvChange } from './x4_events';
import { IconID } from './icon';
import { MenuItem, MenuOrSep } from './menu';
/**
 * Button events
 */
interface ButtonEventMap extends CEventMap {
    click: EvClick;
}
declare type MenuCallBack = () => MenuOrSep[];
/**
 * Button properties
 */
interface ButtonProps<E extends ButtonEventMap = ButtonEventMap> extends CProps<E> {
    text?: string | HtmlString;
    icon?: IconID;
    rightIcon?: IconID;
    align?: 'center' | 'left' | 'right';
    autoRepeat?: number;
    menu?: MenuOrSep[] | MenuCallBack;
    click?: EventCallback<EvClick>;
}
/**
 * Base button
 */
export declare class BaseButton<P extends ButtonProps = ButtonProps, E extends ButtonEventMap = ButtonEventMap> extends Component<P, E> {
    constructor(props: P);
    render(props: ButtonProps): void;
    /**
     * starts/stops the autorepeat
     */
    private _startAutoRep;
    /**
     *
     */
    protected _handleKeyDown(ev: KeyboardEvent): void;
    /**
     * called by the system on click event
     */
    protected _handleClick(ev: MouseEvent): void;
    /**
     * sends a click to the observers
     */
    protected _sendClick(): void;
    /**
     * change the button text
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello'
     * });
     *
     * btn.text = 'world';
     * ```
     */
    set text(text: string | HtmlString);
    get text(): string | HtmlString;
    /**
     * change the button icon
     * todo: do nothing if no icon defined at startup
     *
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello',
     *  icon: 'close'
     * });
     * btn.setIcon( 'open' );
     * ```
     */
    set icon(icon: IconID);
    get icon(): IconID;
    /**
     * change the button right icon
     * todo: do nothing if no icon defined at startup
     *
     * @example
     * ```ts
     * let btn = new Button( {
     * 	text: 'hello',
     *  icon: 'close'
     * });
     * btn.setIcon( 'open' );
     * ```
     */
    set rightIcon(icon: IconID);
    get rightIcon(): IconID;
    /**
     *
     */
    set menu(items: MenuItem[]);
}
/**
 *
 */
export declare class Button extends BaseButton<ButtonProps> {
}
interface ToggleButtonEventMap extends ButtonEventMap {
    change: EvChange;
}
interface ToggleButtonProps extends ButtonProps<ToggleButtonEventMap> {
    checked: boolean;
    checkedIcon?: IconID;
}
/**
 *
 */
export declare class ToggleButton extends BaseButton<ToggleButtonProps, ToggleButtonEventMap> {
    constructor(props: ToggleButtonProps);
    /**
     *
     */
    render(props: ToggleButtonProps): void;
    /**
     *
     */
    protected _sendClick(): void;
    private _updateIcon;
}
export {};
