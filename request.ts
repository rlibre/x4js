/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file request.ts
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


/**
 * TODO: use fetch api
 * 

async function xx( resp, cb ) {
	cb( await resp.json() ); 
}

async function getToto( cb ) {
    fetch('home/toto', { method: 'GET' }).then( (resp) => { xx(resp,cb); } );
}

function dump( resp ) {
	console.log( resp );
}

getToto( dump );

*/


import { isArray, isLiteralObject, isString, NetworkError } from './tools'

const DEFAULT_TIMEOUT = 10000;

export interface RequestProps
{
	url: string;
	method?: 'GET' | 'POST';
	headers?: string[];
	params?: any;
	timeout?: number;
	responseType?: 'text' | 'json' | 'arraybuffer';
	userData?: any;

	success: ( data: any, userData: any ) => void;
	failure?: ( status: number, statusText: string, userData: any ) => void;
	progress?: ( length: number, total: number, display: string ) => void;
}


export function ajaxRequest( cfg: RequestProps ) : Function {
	
	let params,
		url = cfg.url,
		method = cfg.method || 'GET',
		formdata = false;

	if( cfg.params instanceof FormData ) {
		params = cfg.params;
		formdata = true;
	}
	else if( method=='POST' ) {
		params = buildQuery( cfg.params, false );
	}
	else {
		url += buildQuery( cfg.params, true );
	}

	url = encodeURI( url );

	let xhr = new XMLHttpRequest( );
	xhr.open( method, url );

	xhr.upload.addEventListener( 'progress', progress, false);
	xhr.addEventListener( 'timeout', failure );
	xhr.addEventListener( 'error', failure );
	xhr.addEventListener( 'load', success );
	
	if( !formdata ) {
		xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=UTF-8" );
	}
	
	if( method!='POST' ) {
		xhr.responseType = cfg.responseType || 'json';
		xhr.timeout = cfg.timeout || DEFAULT_TIMEOUT;
	}

	if( cfg.headers ) {
		for( let h in cfg.headers) {
			this.xhr.setRequestHeader( h, cfg.headers[h] );
		}
	}

	function progress( ev: ProgressEvent<EventTarget> ) {
		console.log( ev );
		if( cfg.progress ) {
			try {
				if( ev.lengthComputable ) {
					let disp = humanSize( ev.loaded ) + ' / ' + humanSize( ev.total );
					cfg.progress( ev.loaded, ev.total, disp );
				}
			}
			catch( e ) {
				console.error( 'unhandled exception:', e );
			}
		}
	}

	function humanSize( bytes: number ) {

		let unit, value: number;

		if( bytes>=1e9 ) {
			unit = 'Gb';
			value = bytes/1e9;	
		}
		else if( bytes>=1e6 ) {
			unit = 'Mb';
			value = bytes/1e6;	
		}
		else if( bytes>=1e3 ) {
			unit = 'Kb';
			value = bytes/1e3;	
		}
		else {
			unit = 'bytes';
			value = bytes;	
		}

		return value.toFixed( 2 ) + unit;
	}

	function failure(  ) {
		if( cfg.failure ) {
			cfg.failure( xhr.status, xhr.statusText, cfg.userData );
		}
	}

	function success( ) {
		if( xhr.status>=200 && xhr.status<300 ) {
			if( cfg.success ) {
				try {
					cfg.success( xhr.response, cfg.userData );
				}
				catch( e ) {
					console.error( 'unhandled exception:', e );
				}
			}
		}
		else {
			failure( );
		}	
	}

	if( formdata || method=='POST' ) {
		xhr.send( params );
	}
	else {
		xhr.send( );
	}

	return function( ) {
		xhr.abort( );
	};
}

function  buildQuery( params: any, getMethod: boolean ) {

	if( !params ) {
		return '';
	}

	let query = [];
	for( let key in params ) {

		let param = params[key];

		// array
		if( isArray(param) ) {
			for( let i=0, n=param.length; i<n; i++ ) {
				query.push( encodeURIComponent(key) + '[]=' + encodeURIComponent( ''+param[i] ) );
			}
		}
		// simple string ...
		else {

			if( param===undefined ) {
				param = '';
			}
			query.push( encodeURIComponent(key) + '=' + encodeURIComponent(''+param) );
		}
	}

	let result = query.join( '&' );
	if( getMethod ) {
		return '?' + result;
	}
	else {
		return result;
	}
}


//type Identity<T> = { [P in keyof T]: T[P] }
//type Replace<T, K extends keyof T, TReplace> = Identity<Pick<T, Exclude<keyof T, K>> & {
//    [P in K] : TReplace
//}>
//type AjaxRequestInit = Replace< RequestInit, 'body', BodyInit | null | object | undefined >;


interface AjaxRequestInit extends Omit<RequestInit,'body'> {
	body?: BodyInit | null | object;
	noGenX?: boolean;	// donot generate exception on error
}


export async function ajaxAsJSON( url: string, init?: AjaxRequestInit ) : Promise<any> {
	let response = await ajax( url, init, 'application/json' );
	return response.json( );
}

export async function ajaxAsText( url: string, init?: AjaxRequestInit ) : Promise<any> {
	let response = await ajax( url, init, 'text/plain' );
	return response.text( );
}

/**
 * use encodeURIComponent for elements in url
 */

export async function ajax( url: string, init?: AjaxRequestInit, type?: string ) : Promise<Response> {

	let options: AjaxRequestInit = { 
		method: 'GET',
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	}

	if( type ) {
		options.headers['Content-Type'] = type;
	}

	if( init ) {
		options = { ...options, ...init };

		if( init.body && !isString(init.body) ) {
			let cvt = false;
			if( isLiteralObject(init.body) ) {
				cvt = true;
			}
			else if( !(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer) && !(init.body instanceof FormData) &&
				!(init.body instanceof URLSearchParams) && !(init.body instanceof ReadableStream) )
			{
				cvt = true;
			}

			if( cvt ) {
				options.body = JSON.stringify( init.body );
			}
			else {
				options.body = init.body;
			}
		}
	}

	let response = await fetch( url, options as RequestInit );

	if( init && init.noGenX ) {
		return response;
	}
	else {
		if( !response.ok ) {
			throw new NetworkError( response );
		}

		return response;
	}
}