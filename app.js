/*jshint node: true */
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var less = require('less-middleware');

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(less({
        src: __dirname + '/public',
        compress: true
    }));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

