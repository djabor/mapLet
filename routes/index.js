var http = require('http')
  , fs = require('fs');

/*
 * GET home page.
 */

function returnRoute(url, httpClient) {
	console.log('preparing request to ' + url)
    u = require('url').parse(url)
    var remote_client = httpClient.createClient(80, u['host']);
    var request = remote_client.request("GET", u['pathname'], {"host": u['host']});
    console.log("request made")
    request.addListener('response', function (response) {
        response.setEncoding('binary');
        var body = '';

        response.addListener('data', function (chunk) {
            body += chunk;
            console.log('chunk received')
        });
    });
    return body;
}

exports.index = function(req, res){
  res.render('layout', { title: 'Express' });
};

exports.views = function(req, res){
    var file = 'views/partials/'+req.params.view+'.jade';
    fs.exists(file, function(exists){
        exists ? res.render('partials/'+req.params.view) : res.send(404);
    });
}