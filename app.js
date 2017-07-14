'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let _constants = require('./constants');
var http = require('http');

let app = express();
let auth = {
    refresh_token: '',
    access_token: ''
};

app.use(bodyParser.text({type: '*/*'}));
app.use(myMiddleware);
app.set('view engine', 'ejs');

// Set up the port
var port = normalizePort(process.env.PORT || _constants.PORT);
app.set('port', port);

// Create the HTTP web server
var server = http.createServer(app);

// Listen on the provided port
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalizes the port into a string or number
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for the HTTP web server's "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.log(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.log(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('info', 'Listening on ' + bind);
}

function myMiddleware(req, res, next) {
    req.rawBody = req.body;
    if(req.headers['content-type'] === 'application/json') {
        req.body = JSON.parse(req.body);
    }
    next();
}

function getIngestionUrl(endpoint) {
    return _constants.BASE_URL + 'services/data/v41.0/sobjects/' + endpoint;
}

app.get('/', function (req,res) {
    res.sendfile('home.html');
});

app.post('/endpoint', function (req, res) {

    // console.log(req.body);
    let reqBody;
    let reqJSON;
    let ingestionUrl;
    if (typeof(req.body) === 'string') {
        reqJSON = JSON.parse(req.body);
    } else {
        reqJSON = req.body;
    }
    if (reqJSON['ENDPOINT'] || reqJSON['endpoint']) {
        ingestionUrl = getIngestionUrl(reqJSON['ENDPOINT'] || reqJSON['endpoint']);
    } else {
        ingestionUrl = getIngestionUrl(_constants.DEFAULT_ENDPOINT);
    }
    reqBody = JSON.stringify(req.body);

    request({
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + _constants.TOKEN,
          'Content-Type': 'application/json'
        },
        url: ingestionUrl,
        body: reqBody
    }, function(error, response, body) {
        // console.log(response);
        console.log(error);
        res.end();
    });
});


