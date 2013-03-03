var cluster = require('cluster'),
numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork();
  });
} else {
  var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , gmap = require('./controllers/gmap')
    , path = require('path')
    , gp = require('gpan');

  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
    app.use(require('less-middleware')({ src: __dirname + '/public', compress: true, optimization: 2 }));
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('development mode');
  });

  app.configure('production', function(){
    var live = 86400000;
    app.use(express.static(path.join(__dirname, 'public', {maxAge: live})));
    console.log('production mode');
  });

  app.get('/', routes.index);
  app.get('/views/:view.html', routes.views);
  app.post('/resources/polys', gmap.LLtoPanos);
  app.post('/resources/trace', gmap.traceRoute);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}