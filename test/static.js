var assert = require( 'assert' );
var http = require( 'http' );
var path = require( 'path' );
var request = require( 'request' );
var fs = require( 'fs' );
var proxyMe = require( '../src/' );
var server;

describe( 'static content', function() {
    before( function() {
        server = proxyMe({
            dir: path.join( __dirname, 'fixtures' ),
            routes: {
                'foo': 'http://bar.com'
            }
        });
    });

    after( function() {
        server.close();
    });

    it( 'should serve files that are in the file system', function( done ) {
        request( 'http://localhost:3000/foo.json', function( err, response ) {
            if ( err ) {
                return done( err );
            }

            assert( response.statusCode == 200 );
            assert( response.body == '{ "foo": "bar" }\n' );
            assert( response.headers['content-type'] == 'application/json' );
            done();
        });
    });

    it( 'should return 404 if file not found', function( done ) {
        request( 'http://localhost:3000/foobar', function( err, response ) {
            if ( err ) {
                return done( err );
            }

            assert( response.statusCode == 404 );
            done();
        });
    });

    it( 'should return 500 if there\'s an error', function( done ) {
        fs.chmodSync( path.join( __dirname, 'fixtures', 'root_permissions.txt' ), '000' );
        request( 'http://localhost:3000/root_permissions.txt', function( err, response ) {
            if ( err ) {
                return done( err );
            }

            assert( response.statusCode == 500 );
            fs.chmodSync( path.join( __dirname, 'fixtures', 'root_permissions.txt' ), '644' );
            done();
        });
    });
});
