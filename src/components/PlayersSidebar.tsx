import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './PlayersSidebar.css';

const SOCKET_URL = 'http://localhost:4000'; // Change if backend is hosted elsewhere
const ROOM_ID = 'default-room'; // For demo, use a single room

const socket: Socket = io(SOCKET_URL, { autoConnect: false });

const PlayersSidebar: React.FC = () => {
  const [players, setPlayers] = useState<{ name: string; score: number }[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!joined) {
      const name = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 1000)}`;
      socket.connect();
      socket.emit('join_room', { roomId: ROOM_ID, name });
      setJoined(true);
    }
    socket.on('players_update', (playersList) => {
      setPlayers(playersList);
    });
    return () => {
      socket.off('players_update');
    };
  }, [joined]);

  return (
    <aside className="players-sidebar">
      <h2>Players</h2>
      <ul>
        {players.map((player) => (
          <li key={player.name} className="player-row">
            <span className="player-name">{player.name}</span>
            <span className="player-score">{player.score}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default PlayersSidebar; 