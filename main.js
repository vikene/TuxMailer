'use strict';
const electron = require('electron')
const electronapp = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

process.chdir(__dirname);

var cluster = require('cluster');
var config = require('config');
var log = require('npmlog');
var os = require('os');

//log.level = config.log.level;

process.on('SIGTERM', function() {
  log.warn('exit', 'Exited on SIGTERM');
  process.exit(0);
});

process.on('SIGINT', function() {
  log.warn('exit', 'Exited on SIGINT');
  process.exit(0);
});

process.on('uncaughtException', function(err) {
  log.error('uncaughtException ', err);
  process.exit(1);
});
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 1000, height: 580,frame:false})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {

    mainWindow = null
  })
}


electronapp.on('ready', createWindow)

electronapp.on('window-all-closed', function () {

  if (process.platform !== 'darwin') {
    electronapp.quit()
  }
})

electronapp.on('activate', function () {

  if (mainWindow === null) {
    createWindow()
  }
})

var express = require('express');
var compression = require('compression');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var net = require('net');
var development = (process.argv[2] === '--dev');
app.use(function(req, res, next) {
  next();
});

app.use('/tpl/read-sandbox.html', function(req, res, next) {
  res.set('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// redirect all http traffic to https
app.use(function(req, res, next) {
  if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https') && !development) {
    res.redirect('https://' + req.hostname + req.url);
  } else {
    next();
  }
});

// use gzip compression
app.use(compression());



io.on('connection', function(socket) {

  socket.on('open', function(data, fn) {
    if (!development && config.server.outboundPorts.indexOf(data.port) < 0) {
      socket.disconnect();
      return;
    }

    var tcp = net.connect(data.port, data.host, function() {

      tcp.on('data', function(chunk) {
        socket.emit('data', chunk);
      });

      tcp.on('error', function(err) {
        socket.emit('error', err.message);
      });

      tcp.on('end', function() {
        socket.emit('end');
      });

      tcp.on('close', function() {
        socket.emit('close');

        socket.removeAllListeners('data');
        socket.removeAllListeners('end');
      });

      socket.on('data', function(chunk, fn) {
        if (!chunk || !chunk.length) {
          if (typeof fn === 'function') {
            fn();
          }
          return;
        }
        tcp.write(chunk, function() {
          if (typeof fn === 'function') {
            fn();
          }
        });
      });

      socket.on('end', function() {
        tcp.end();
      });

      if (typeof fn === 'function') {
        fn(os.hostname());
      }

      socket.on('disconnect', function() {
        tcp.end();
        socket.removeAllListeners();
      });
    });
  });
});

//
// start server
//

server.listen(8889);
if (development) {
  console.log(' > starting in development mode');
}
console.log(' > listening on http://localhost:' + 8889+ '\n');
