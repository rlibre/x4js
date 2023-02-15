/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file app_sockets.ts
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

import { Application } from "./application"
import { EvMessage } from "./x4events"

/**
 * WEB SOCKETS
 * 
 * les messages reçus par l'application sont retransmis au websocket.
 * comme ça, tous les clients connectés sur le serveur recevront une copie du message.
 * ca permet de mettre a jour les clients dynamiquement
 * 
 */

const msg_sent = Symbol( 'msg_sent' );

export function setupWSMessaging( closeCB: ( ) => void ) {
	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const sockets = new WebSocket( `${protocol}${window.location.hostname}:${window.location.port}`, 'messaging' );

	const app = Application.instance( );

	// pour tous les messages recus par l'application
	//	on transmet aux autres
	app.on( 'global', ( e: EvMessage ) => {
		if( (e as any)[msg_sent] ) {
			return;
		}

		sockets.send( JSON.stringify( {
			msg: e.msg,
			params: e.params,
		} ) );
	});

	// reception d'un message
	sockets.onmessage = ( e ) => {
		if( e.data!='ping' ) {
			const message = JSON.parse(e.data);
			message[msg_sent] = true;
			app.signal( 'global', message );
		}
	}

	// perte du socket
	sockets.onclose = ( ev ) => {
		console.log( 'websocket closed:', ev );
		closeCB( );
	}

	sockets.onerror = (ev )=> {
		console.log( 'websocket error:', ev );
	}
}