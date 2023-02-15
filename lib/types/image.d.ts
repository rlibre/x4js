/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file image.ts
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
import { Component, CProps } from './component';
interface ImageProps extends CProps {
    src: string;
    alt?: string;
    lazy?: boolean;
    alignment?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none';
}
/**
 * Standard image class
 */
export declare class Image extends Component<ImageProps> {
    protected m_created: boolean;
    protected m_lazysrc: string;
    constructor(props: ImageProps);
    /** @ignore */
    render(): void;
    /**
     * change the image
     * @param src - image path
     */
    setImage(src: string, force?: boolean): void;
    private _update_image;
    private static lazy_images_waiting;
    private static lazy_image_timer;
    private static lazyWatch;
}
export {};
