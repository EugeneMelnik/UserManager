require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const cors = require('cors');
const router = require('./controllers');
const { executeQuery } = require('./DB');
const createUsersTable = require('./queries/createUsersTable');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true
  })
);

app.use(bodyParser.json());

app.use(router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_URL
  }
});

router.setSocketServer(io);

io.on('connection', (socket) => {
  console.log('A user connected ' + socket.id);

  socket.on('block', (data) => {
    for (let [, socket] of io.of('/').sockets) {
      const accessToken = socket.handshake.auth.token;
      const { id } = jwt.decode(accessToken, process.env.JWT_SECRET);

      if (data.receiverIds.includes(id)) {
        socket.emit('block_response', data);
      }
    }
  });

  socket.on('delete', (data) => {
    for (let [, socket] of io.of('/').sockets) {
      const accessToken = socket.handshake.auth.token;
      const { id } = jwt.decode(accessToken, process.env.JWT_SECRET);

      if (data.receiverIds.includes(id)) {
        socket.emit('delete_response', data);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected ' + socket.id);
  });
});

server.listen(port, async () => {
  await executeQuery(createUsersTable());

  console.log(`Server was running on port ${port}`);
});
