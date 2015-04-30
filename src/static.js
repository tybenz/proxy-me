var path = require( 'path' );
var fs = require( 'fs' );

module.exports = function( dir, req, res ) {
    var filePath = path.join( dir, req.url );
    if ( req.url == '/' ) {
        filePath = path.join( dir, 'index.html' );
    }

    var extname = path.extname( filePath );
    var contentType = 'text/html';
    switch ( extname ) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        default: break;
    }

    fs.readFile( filePath, function( error, content ) {
        if ( error ) {
            if ( error.code == 'ENOENT' ) {
                res.writeHead( 404 );
                res.end( 'Not found' );
            } else {
                res.writeHead( 500 );
                res.end( 'Application Error' );
            }
        } else {
            res.writeHead( 200, { 'Content-Type': contentType });
            res.end( content, 'utf-8' );
        }
    });
};
