/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file button.ts
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
import { Component, CProps, CEventMap, HtmlString } from './component';
import { EventCallback, EvClick, EvChange } from './x4events';
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
