// import required elements
import { Application, VLayout, Label, installHMR, HLayout, Image, Flex, formatIntlDate, Container, Button, Icon, Menu, MenuItem, MessageBox, EvClick, ContainerProps } from 'x4js'

// create the application
let app = new Application( {
	app_name: "template",
	app_version: "1.0.0"
} );

// -----------------------------------------------------------------
// the header bar
//	just one icon, a title and a user button
//

/**
 * we declare a custom property: title
 */

interface HeaderProps extends ContainerProps {
	title: string;
}

/**
 * the the header class
 */

class Header extends HLayout {

	constructor( props: HeaderProps ) {
		super( props );

		this.addClass( "center" );

		this.setContent( [
			new Icon( { id: "logo", icon: 'url(assets/logo.svg)' } ),
			new Label( { id: 'title', text: props.title, flex: 1 } ),
			new Button( { id: 'usr-btn', icon: 'var(--icon-usr-btn)', click: ( e ) => this._openMenu( e ) } ),
		]);

		// instead of using elements with ids, we should have make a member with them:
		// then use directly the member
		// see Footer class to see how
	}

	private _openMenu( ev: EvClick ) {
		const menu = new Menu( {
			items: [
				new MenuItem( { text: "Logout", click: ( ) => {
					MessageBox.show( "Logout" );
				} } ),
			]
		})

		const btn = this.itemWithId( 'usr-btn' )
		const rc = btn.getBoundingRect( );
		menu.displayAt( rc.left, rc.bottom );
	}

	// just use Header.title = 'blah' to change the title
	
	set title ( title: string ) {
		//this.m_props.title = title;
		this.itemWithId<Label>( 'title' ).text = title;
	}
}

// -----------------------------------------------------------------
// the footer bar
//	just display time at right 

class Footer extends HLayout {

	time: Label;

	constructor( props ) {
		super( props );

		this.addClass( "center" );

		this.setContent( [
			new Flex( ), // time is 'pushed' by flex to the right
			this.time = new Label( "" ),
		]);

		this.startTimer( "u", 1000, true, ( ) => {
			this.time.text = formatIntlDate( new Date(), "H:M:S" );
		});
	}
}

// -----------------------------------------------------------------
// create the main frame, this is just a vertical layout
//

let frame = new VLayout( {
	cls: "@fit",
	content: [
		new Header( { title: "X4 Application" } ),
		new Container( { flex: 1 } ),
		new Footer( { } ),
    ]
});

// define it as the app main frame.
app.mainView = frame;

declare const DEBUG; // defined by x4build
if( DEBUG ) {
	installHMR();	// this way, in debug mode, the page is automatically refreshed on source change (if --hmr specified in x4build command line)
}
