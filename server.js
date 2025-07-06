const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// --- Game State ---
let rooms = {};
const WORDS = ['apple', 'car', 'house', 'cat', 'tree', 'phone', 'pizza', 'dog', 'book', 'star'];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  let currentRoom = null;
  let playerName = null;

  socket.on('join_room', ({ roomId, name }) => {
    playerName = name;
    currentRoom = roomId;
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], game: null };
    }
    rooms[roomId].players.push({ id: socket.id, name, score: 0 });
    socket.join(roomId);
    io.to(roomId).emit('players_update', rooms[roomId].players);
  });

  socket.on('start_game', () => {
    if (!currentRoom) return;
    const room = rooms[currentRoom];
    if (!room) return;
    // Pick a random player to draw
    const drawerIdx = Math.floor(Math.random() * room.players.length);
    const drawer = room.players[drawerIdx];
    const word = getRandomWord();
    room.game = {
      drawerId: drawer.id,
      word,
      guesses: [],
      started: Date.now(),
      finished: false
    };
    io.to(currentRoom).emit('game_started', {
      drawerId: drawer.id,
      drawerName: drawer.name
    });
    io.to(drawer.id).emit('your_word', { word });
  });

  socket.on('drawing_data', (data) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('drawing_data', data);
  });

  socket.on('guess_word', (guess) => {
    if (!currentRoom) return;
    const room = rooms[currentRoom];
    if (!room || !room.game || room.game.finished) return;
    const correct = guess.trim().toLowerCase() === room.game.word;
    if (correct) {
      // Award points based on time
      const timeTaken = (Date.now() - room.game.started) / 1000;
      let points = Math.max(100 - Math.floor(timeTaken * 5), 10);
      const player = room.players.find(p => p.id === socket.id);
      if (player) player.score += points;
      room.game.finished = true;
      io.to(currentRoom).emit('correct_guess', {
        playerId: socket.id,
        playerName: player.name,
        word: room.game.word,
        points
      });
      io.to(currentRoom).emit('players_update', room.players);
    } else {
      io.to(currentRoom).emit('guess_attempt', {
        playerId: socket.id,
        playerName: playerName,
        guess
      });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].players = rooms[currentRoom].players.filter(p => p.id !== socket.id);
      io.to(currentRoom).emit('players_update', rooms[currentRoom].players);
      if (rooms[currentRoom].players.length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Scribble backend listening on port ${PORT}`);
}); 