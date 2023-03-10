#!node
const esbuild = require('esbuild');
const fs = require('fs-extra');
const less = require('less');
const tsc = require('typescript');	// for .d.ts files

async function main( ) {

	fs.mkdirpSync( 'lib/styles' );
	fs.mkdirpSync( 'lib/src' );
	fs.mkdirpSync( 'lib/esm' );
	fs.mkdirpSync( 'lib/cjs' );
	fs.mkdirpSync( 'lib/types' );

	await esbuild.build({
			entryPoints: ['src/index.ts'],
			outfile: 'lib/esm/index.mjs',
			bundle: true,
			sourcemap: true,
			keepNames: true,
			minify: false,
			format: 'esm',
			allowOverwrite: true,
			target: ['esnext']
		});
		
	console.log( "esm done.")
			
	await esbuild.build({
			entryPoints: ['src/index.ts'],
			outfile: 'lib/cjs/index.js',
			bundle: true,
			sourcemap: true,
			keepNames: true,
			allowOverwrite: true,
			minify: true,
			format: 'cjs',
			target: ['esnext']
		})

	console.log( "cjs done.")

	fs.copySync( 'src/', 'lib/src/' );
	fs.copyFileSync( 'src/x4.less', 'lib/styles/x4.less' );
	fs.copyFileSync( 'changelog.txt', 'lib/changelog.txt' );
	fs.copyFileSync( 'README.md', 'lib/README.txt' );
	fs.copyFileSync( 'license.md', 'lib/licence.md' );

	async function compileLess( input ) {
			
		try {
			const less_code = fs.readFileSync( input, 'utf-8' );
			const out = await less.render( less_code );
			fs.writeFileSync( 'lib/styles/x4.css', out.css, 'utf-8' );arguments
		}
		catch( e ) {
			if( e instanceof less.LessError ) {
				console.log( `less error: ${input}(${e.line}): ${e.message}` );
			}
			else {
				console.log( e );
			}
		}
	}

	function makeDTS( input ) {
		const prog = tsc.createProgram( [input], {
			declaration: true,
			emitDeclarationOnly: true,
			outDir: 'lib/types',
		});
		
		prog.emit( );
		console.log( 'types done.' );
	}

	console.log( "less..." );
	compileLess( 'src/x4.less' )
		.then( ( ) => {
			console.log( "less done.")
		});

	console.log( "types..." );
	makeDTS( "src/index.ts");
}

main( );