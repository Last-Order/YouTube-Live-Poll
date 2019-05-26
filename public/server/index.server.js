const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');

server.listen(9317);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/options', (req, res) => {
  res.json(
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../runtime/options.json')).toString()
    )
  );
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

io.on('connection', function (socket) {
  socket.on('refresh-options', (data) => {
    socket.broadcast.emit('refresh-options', data);
  });
  socket.on('update-result', (data) => {
    socket.broadcast.emit('update-result', data);
  });
  socket.on('update-language', (data) => {
    socket.broadcast.emit('update-language', data);
  });
});

module.exports = {};