const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let rooms = {}; 

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        if (!rooms[room]) rooms[room] = [];
        
        let role = rooms[room].length === 0 ? 'w' : 'b';
        rooms[room].push({ id: socket.id, username, role });

        socket.emit('playerRole', { role, room });
        io.to(room).emit('updateUserList', rooms[room]);
    });

    socket.on('chessMove', (data) => {
        socket.to(data.room).emit('moveFromServer', data.move);
    });

    socket.on('chatMessage', (data) => {
        io.to(data.room).emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(p => p.id !== socket.id);
            io.to(room).emit('updateUserList', rooms[room]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
