import { Component, ComponentContent } from './component';


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

