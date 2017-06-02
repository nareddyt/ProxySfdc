let express = require('express');
let bodyParser = require('body-parser')
let request = require('request');
let _constants = require('./constants');

let app = express();
let auth = {
    refresh_token: '',
    access_token: ''
};

app.use(bodyParser.text({type: '*/*'}));
app.use(myMiddleware);
app.set('view engine', 'ejs');

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
    res.send("Smart Gates")
});

app.post('/endpoint', function (req, res) {

    console.log(req.body);
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
    reqBody = JSON.stringify(req.body.payload);

    request({
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + _constants.TOKEN,
          'Content-Type': 'application/json'
        },
        url: ingestionUrl,
        body: reqBody
    }, function(error, response, body) {
        console.log(response);
        console.log(error);
        res.end();
    });
});

// Settng up server
let server = app.listen(_constants.PORT, function () {

    let host = server.address().address;
    let port = server.address().port;
    console.log("Forwarding app listening at http://%s:%s", host, port)

});


