/**
* @file host/electron.ts
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

import { x4document } from '../dom-gen'
import { FileStat, PathType, PartType, Host } from './host'

export * from './host';

declare const require;
declare const host_require;

if( !globalThis.host_require ) {
	globalThis.host_require = require;
}

export const fs 		= host_require( 'fs' );
export const process 	= host_require( 'process' );
export const electron  	= host_require( 'electron' );
export const path  		= host_require( 'path' );

//import * as path from 'node:path';	

export class ElectronHost extends Host {

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
			let zlib = this.require('zlib');
			zlib.gzip( data, ( err, Uint8Array ) => {
				if( err ) { reject( err); }
				else { resolve( Uint8Array); }
			} );
		} );
	}

	decompress( data: Uint8Array ): Promise<Uint8Array> {
		return new Promise( (resolve, reject ) => {
			let zlib = this.require('zlib');
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
			atime: stat.atimeMs,
			isDir: stat.isDirectory()
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
		return host_require( name );
	} 

	cwd( ): string {
		return process.cwd( );
	}

	get ipc( ) {
		return electron.ipcRenderer;
	}

	getPath( type: PathType ) : string {
		return this.ipc.sendSync( 'getPath', type );
	}

	getPathPart( pth: string, type: PartType ) : string {
	
		let els = path.parse( pth );
		switch ( type ) {
			case 'dirname': return els.dir;
			case 'basename': return els.base;
			case 'filename': return els.name;
			case 'extname': return els.ext;
		}
		
		return '';
	}

	createCanvas = ( ) => {
		return x4document.createElement('canvas');
	}
}

new ElectronHost( );
