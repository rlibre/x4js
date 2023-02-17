/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file x4react.ts
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

import { Component, ComponentContent, CProps, CEventMap } from './component';


const createElement = ( clsOrTag, attrs, ...children ): ComponentContent => {

	let comp: Component;

	// fragment
	if( clsOrTag==createFragment || clsOrTag==Fragment ) {
		return children;
	}
	// class constructor, yes : dirty
	else if( clsOrTag instanceof Function ) {
		comp = new (clsOrTag as any)( attrs );
	}
	// basic tag
	else {
		comp = new Component( {
			tag: clsOrTag,
			...attrs,
		});
	}

	if( children && children.length ) {
		comp.setContent( children );
	}

	return comp;
}

const Fragment = Symbol( "fragment" );

const createFragment = ( ): ComponentContent => {
	return null;
}

export let React = {
	createElement,
	createFragment,
	Fragment,
}





/**
 * 
 */

 export abstract class TSXComponent<P extends CProps<CEventMap> = CProps<CEventMap>, E extends CEventMap = CEventMap> extends Component<P,E> {
	public render(props: P) {
		const tsx = this.renderTSX( props );
		if( tsx ) {
			this.setContent( tsx );
		}
	}

	public abstract renderTSX( props: P ): Component | Component[];
}

