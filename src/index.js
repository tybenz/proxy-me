var http = require( 'http' );
var https = require( 'https' );
var util = require( 'util' );
var path = require( 'path' );
var fs = require( 'fs' );
var request = require( 'request' );
var static = require( './static' );

var log = function() {
    if ( !process.env.NODE_TEST ) {
        console.log.apply( null, arguments );
    }
};

module.exports = function( opts ) {
    opts = util._extend({
        port: 3000,
        certPath: path.join( __dirname, '..', 'ssl', 'cert.pem' ),
        keyPath: path.join( __dirname, '..', 'ssl', 'key.pem' ),
        https: false,
        dir: process.cwd()
    }, opts );

    var server;
    var routes = opts.routes;
    var reqHandler = function( req, res ) {
        var found = false;
        Object.keys( opts.routes ).forEach( function( target ) {
            var reg = new RegExp( '^\\/' + target + '\\/' );
            var source = routes[ target ];
            var targetPath = req.url.replace( reg, '' );

            if ( req.url.match( reg ) ) {
                log( req.method, req.url, '->', source + '/' + targetPath );
                found = true;
                req.pipe( request[ req.method.toLowerCase() ]( source + '/' + targetPath ) ).pipe( res );
                return false;
            }
        });

        if ( !found ) {
            log( req.method, req.url );
            static( opts.dir, req, res );
        }
    };

    if ( opts.https ) {
        server = https.createServer({
            key: fs.readFileSync( opts.keyPath ),
            cert: fs.readFileSync( opts.certPath )
        }, reqHandler );
    } else {
        server = http.createServer( reqHandler );
    }

    server.listen( opts.port, function() {
        log( 'SERVER START', opts.port );
        log( 'ROUTES',  routes );
    });

    return server;
};
