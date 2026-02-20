const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {}; // Players ka track rakhne ke liye

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Pehle aane wala White, dusra Black
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'b');
    } else {
        socket.emit('playerRole', 'viewer'); // Teesra banda sirf dekh payega
    }

    socket.on('chessMove', (move) => {
        socket.broadcast.emit('moveFromServer', move);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.white) delete players.white;
        if (socket.id === players.black) delete players.black;
    });
});

server.listen(3000, () => {
    console.log('Game Live: http://localhost:3000');
});