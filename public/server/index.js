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
      fs.readFileSync(path.resolve(__dirname, './options.json')).toString()
    )
  );
});

app.use('/assets', express.static(path.join(__dirname, '../assets')));

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
});