/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file local_storage.ts
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

import { host } from './hosts/host';

export class Settings {

	private m_data: any;
	private m_name: string;

	constructor( name?: string ) {
		this.m_data = null;
		this.m_name = name ?? 'settings';
	}

	set( name: string, value: any ) {
		this._load( );
		this.m_data[name] = value;
		this._save( );
	}

	get( name: string, defValue? ) : any {
		this._load( );
		return this.m_data[name] ?? defValue;
	}

	private _save( ) {
		let data = JSON.stringify(this.m_data);
		host.writeLocalStorage( this.m_name, data );
	}

	private _load( ) {
		if( this.m_data ) {
			return;
		}

		this.m_data = {};

		let data = host.readLocalStorage( this.m_name );
		if( data!==null ) {
			data = JSON.parse( data );
			if( data ) {
				this.m_data = data;
			}
			else {
				console.info('There was an error attempting to read your settings.');
				
			}
		}
		// console.info('There was an error attempting to read your settings.');
	}
}

