var assert = require( 'assert' );
var http = require( 'http' );
var path = require( 'path' );
var request = require( 'request' );
var proxyMe = require( '../src/' );
var server;

var mockServer = http.createServer( function( req, res ) {
    if ( req.method == 'GET' && req.url == '/resources/me' ) {
        res.writeHead( 200 );
        res.end( '{ "foo": "bar" }' );
    }

    if ( req.method == 'POST' && req.url == '/resources' ) {
        res.writeHead( 200 );
        res.end( '{ "foo": "bar2" }' );
    }
}).listen( 3001 );

describe( 'static content', function() {
    before( function() {
        server = proxyMe({
            dir: path.join( __dirname, 'fixtures' ),
            routes: {
                'service': 'http://localhost:3001'
            }
        });
    });

    after( function() {
        server.close();
    });

    it( 'should proxy requests from target path to source prefix', function( done ) {
        request( 'http://localhost:3000/service/resources/me', function( err, response ) {
            if ( err ) {
                return done( err );
            }

            assert( response.statusCode == 200 );
            assert( response.body == '{ "foo": "bar" }' );
            done();
        });
    });

    it( 'should proxy requests from target path to source prefix - POST', function( done ) {
        request(
            {
                method: 'POST',
                url: 'http://localhost:3000/service/resources'
            },
            function( err, response ) {
                if ( err ) {
                    return done( err );
                }

                assert( response.statusCode == 200 );
                assert( response.body == '{ "foo": "bar2" }' );
                done();
            }
        );
    });
});
