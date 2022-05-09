/**
* @file host/nwjs.ts
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

import { FileStat, PathType, Host } from './host'

export * from './host';

// to deal with amd modules (that are not comletely compatible with nodejs)
// globalThis.node_require must be set to require BEFORE polyfill code of amd module.
// ie. globalThis.node_require = require;

declare const host_require;
if( !globalThis.host_require ) {
	globalThis.host_require = require;
}

const fs = host_require( 'fs' );
const process = host_require( 'process' );
const path  	= host_require( 'path' );



export class NWJSHost implements Host {

	makePath( ...els: string[] ) {
		return path.join( ...els );
	}

	readBinary( path: string ): Promise<Uint8Array> {
		return new Promise( ( resolve, reject ) => {
			fs.readFile( path, ( err, buff ) => {
				if( err ) { reject( err ); }
				else { resolve( buff ); }
			} );
		} );
	}

	writeBinary( path: string, data: Uint8Array ): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( path, data, ( err ) => {
				if( err ) { reject(err); }
				else { resolve( true ); }
			} );
		} );
	}

	readUtf8( path: string ): Promise<string> {
		return new Promise( ( resolve, reject ) => {
			fs.readFile( path, { encoding: 'utf8' }, ( err, buff ) => {
				if( err ) { reject( err ); }
				else { resolve( buff.toString() ); }
			} );
		} );
	}

	writeUtf8( path: string, data: string ): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( path, data, {encoding: 'utf8'}, ( err ) => {
				if( err ) { reject(err); }
				else { resolve( true ); }
			} );
		} );
	}

	compress( data: Uint8Array ): Promise<Uint8Array> {
		return new Promise( (resolve, reject ) => {
			let zlib = host_require('zlib');
			zlib.gzip( data, ( err, Uint8Array ) => {
				if( err ) { reject( err); }
				else { resolve( Uint8Array); }
			} );
		} );
	}

	decompress( data: Uint8Array ): Promise<Uint8Array> {
		return new Promise( (resolve, reject ) => {
			let zlib = host_require('zlib');
			zlib.gunzip( data, ( err, Uint8Array ) => {
				if( err ) { reject( err); }
				else { resolve( Uint8Array); }
			} );
		} );
	}

	readLocalStorage( name: string ): string {
		return localStorage.getItem( name );
	}

	writeLocalStorage( name: string, data: string ): void {
		localStorage.setItem( name, data );
	}

	stat( name: string ): FileStat {
		let stat = fs.statSync( name );
		if( !stat ) {
			return null;
		}

		return {
			atime: stat.atimeMs
		}
	}

	readDir( path: string ): Promise<string[]> {
		return new Promise( ( resolve, reject ) => {
			fs.readdir( path, ( err, files ) => {
				if( err ) { reject(err); }
				else { resolve(files); }
			});		
		});
	}	

	require( name: string ): any {
		// your amd module must define window.node_require = require;
		return host_require( name );
	} 

	cwd( ): string {
		return process.cwd( );
	}

	getPath( type: PathType ) : string {
		throw 'not imp';
	}
}