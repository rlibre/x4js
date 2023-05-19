// import required elements
import { Application, VLayout, Label, installHMR, HLayout, Image, Flex, formatIntlDate, Container, Button, Icon, Menu, MenuItem, MessageBox, EvClick } from 'x4js'

// create the application
let app = new Application( {
	app_name: "template",
	app_version: "1.0.0"
} );

// the header bar
//	just one icon and a title

class Header extends HLayout {

	constructor( props ) {
		super( props );

		this.addClass( "center" );

		this.setContent( [
			new Icon( { id: "logo", icon: 'url(assets/logo.svg)' } ),
			new Label( { text: "X4 Application", flex: 1 } ),
			new Button( { id: 'user-btn', icon: 'url(assets/bars-light.svg)', click: ( e ) => this._openMenu( e ) } ),
		]);
	}

	private _openMenu( ev: EvClick ) {
		const menu = new Menu( {
			items: [
				new MenuItem( { text: "Logout", click: ( ) => {
					MessageBox.show( "Logout" )
				} } ),
			]
		})

		const btn = this.itemWithId( 'user-btn' )
		const rc = btn.getBoundingRect( );
		menu.displayAt( rc.left, rc.bottom );
	}
}

// the footer bar
//	just time at right bottom

class Footer extends HLayout {

	time: Label;

	constructor( props ) {
		super( props );

		this.addClass( "center" );

		this.setContent( [
			new Flex( ),
			this.time = new Label( "" ),
		]);

		this.startTimer( "u", 1000, true, ( ) => {
			this.time.text = formatIntlDate( new Date(), "H:M:S" );
		});
	}
}


// create the main frame
let frame = new VLayout( {
	cls: "@fit",
    content: [
		new Header( { } ),
		new Container( { flex: 1 } ),
		new Footer( { } ),
    ]
});

// define it as the app main frame.
app.mainView = frame;

declare const DEBUG; // defined by x4build
if( DEBUG ) {
	installHMR()	
}
