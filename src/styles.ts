/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file styles.ts
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

import { pascalCase, isString, isArray } from "./tools";


/**
 *  -- [ @STYLESHEET ] -----------------------------------------------------------------
 */

export class Stylesheet {

	private m_sheet: CSSStyleSheet;
	private m_rules: Map<string, number> = new Map<string,number>( );

	constructor() {
		
		function getStyleSheet( name ) : CSSStyleSheet {
			for(let i=0; i<document.styleSheets.length; i++) {
			  	let sheet = document.styleSheets[i];
			  	if(sheet.title === name ) {
					return <CSSStyleSheet>sheet;
			  	}
			}
		}

		this.m_sheet = getStyleSheet( '@dynamic-css' );
		if( !this.m_sheet ) {
			let dom = document.createElement( 'style' );
			dom.setAttribute('id', '@dynamic-css' );
			document.head.appendChild(dom);

			this.m_sheet = <CSSStyleSheet>dom.sheet
		}
	}

    /**
     * add a new rule to the style sheet
     * @param {string} name - internal rule name 
     * @param {string} definition - css definition of the rule 
     * @example
     * setRule('xbody', "body { background-color: #ff0000; }" );
     */

	public setRule(name: string, definition: any ) {

		if( isString(definition) ) {
			let index = this.m_rules.get( name );
			if (index !== undefined) {
				this.m_sheet.deleteRule(index);
			}
			else {
				index = this.m_sheet.cssRules.length;
			}

			this.m_rules.set( name, this.m_sheet.insertRule( definition, index) );
		}
		else {
			let idx = 1;
			for( let r in definition ) {

				let rule = r + " { ",
					css = definition[r];

				for (let i in css) {
					
					let values = css[i];	// this is an array !
					for (let j = 0; j < values.length; j++) {
						rule += i + ": " + values[j] + "; "
					}
				}

				rule += '}';

				console.log( rule );
				this.setRule( name+'--'+idx, rule );
				idx++;
			}
		}
	}

	/**
	 * return the style variable value
	 * @param name - variable name without '--'
	 * @example
	 * ```
	 * let color = Component.getCss( ).getVar( 'button-color' );
	 * ```
	 */

	public static getVar( name: string ) : any {
		if( !Stylesheet.doc_style ) {
			Stylesheet.doc_style = getComputedStyle( document.documentElement );
		}

    	return Stylesheet.doc_style.getPropertyValue( '--'+name ); // #999999
	}

	static guid: number = 1;
	static doc_style: CSSStyleDeclaration;
}


/**
 *  -- [ @CSSPARSER ] -----------------------------------------------------------------
 * 
 * adaptation of jss-for-node-js
 */

export class CSSParser {

	private result = {};

	parse(css) {
		this.result = {};
		this.parse_json('', css);
		return CSSParser.mk_string(this.result);
	}

	public static mk_string( rules: any ) {

		// output result:	
		let ret = '';

		for (let a in rules) {
			let css = rules[a];
			ret += a + " { "

			for (let i in css) {
				
				let values = css[i];	// this is an array !
				for (let j = 0; j < values.length; j++) {
					ret += i + ": " + values[j] + "; "
				}
			}

			ret += "}\n"
		}

		return ret;
	}

	private parse_json(scope: string, css: any) {

		if (scope && !this.result[scope]) {
			this.result[scope] = {};
		}

		for (let property in css) {

			let value = css[property];

			if ( isArray(value) ) {
				let values = value;
				for (let i = 0; i < values.length; i++) {
					this.addProperty(scope, property, values[i]);
				}
			}
			/*else if (value instanceof Color) {
				this.addProperty(scope, property, value.toString());
			}*/
			else {
				switch (typeof (value)) {

					case "number": {
						this.addProperty(scope, property, value);
						break;
					}

					case "string": {
						this.addProperty(scope, property, value );
						break;
					}

					case "object": {
						this.parse_json(this.makeSelectorName(scope, property), value);
						break;
					}

					default: {
						console.error("ignoring unknown type " + typeof (value) + " in property " + property);
						break;
					}
				}
			}
		}
	}

	private makePropertyName(n: string): string {
		return pascalCase(n);
	}

	private makeSelectorName(scope: string, name: string): string {

		let snames = [];
		let names = name.split(/\s*,\s*/);
		let scopes = scope.split(/\s*,\s*/);

		for (let s = 0; s < scopes.length; s++) {
			let scope = scopes[s];

			for (let i = 0; i < names.length; i++) {

				let name = names[i],
					sub = false;

				if (name.charAt(0) == "&") {
					name = name.substr(1);
					sub = true;
				}

				if (name.charAt(0) === '%') {
					name = '.o-' + name.substr(1);
				}

				if (sub) {
					snames.push(scope + name)
				}
				else {
					snames.push(scope ? scope + " " + name : name)
				}
			}
		}

		return snames.join(", ");
	}

	addProperty(scope: string, property: string, value: any) {

		let properties = property.split(/\s*,\s*/);

		for (let i = 0; i < properties.length; i++) {

			let property = this.makePropertyName(properties[i]);

			if (this.result[scope][property]) {
				this.result[scope][property].push(value);
			}
			else {
				this.result[scope][property] = [value];
			}

			let specials = {
				"box-shadow": [
					"-moz-box-shadow",
					"-webkit-box-shadow"
				],
				"border-radius": [
					"-moz-border-radius",
					"-webkit-border-radius"
				],
				"border-radius-topleft": [
					"-moz-border-radius-topleft",
					"-webkit-border-top-left-radius"
				],
				"border-radius-topright": [
					"-moz-border-radius-topright",
					"-webkit-border-top-right-radius"
				],
				"border-radius-bottomleft": [
					"-moz-border-radius-bottomleft",
					"-webkit-border-bottom-left-radius"
				],
				"border-radius-bottomright": [
					"-moz-border-radius-bottomright",
					"-webkit-border-bottom-right-radius"
				]
			}

			let browser_specials = specials[property];
			for (let j = 0; browser_specials && j < browser_specials.length; j++) {
				this.addProperty(scope, browser_specials[j], value);
			}
		}
	}
}

export class ComputedStyle {
	m_style:CSSStyleDeclaration;

	constructor( style: CSSStyleDeclaration ) {
		this.m_style = style;
	}

	/**
	 * return the raw value
	 */

	value( name: string ) : string {
		name = pascalCase( name );
		return this.m_style[name];
	}

	/**
	 * return the interpreted value
	 */
	
	parse( name: string ) : number {
		name = pascalCase( name );
		return parseInt( this.m_style[name] );
	}

	/**
	 * 
	 */

	get style( ) {
		return this.m_style;
	}
}
