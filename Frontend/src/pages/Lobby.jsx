import React, { useState } from 'react'; 
import "./Lobby.css"

export default function Lobby({
  roomId,
  users,
  isHost,
  startQuiz,
}) {
  const [copied, setCopied] = useState(false);
  return (
 <div className="lobby-container">
  <div className="lobby-card">

    <h2 className="room-id">
      Room ID: {roomId}
    </h2>
    <button
  className="start-btn"
  onClick={() => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
  }}
>
   {copied ? "Copied" : "Copy Room ID"}
</button>

    <h3>Connected Users</h3>

    <ul className="user-list">
      {users.map((user) => (
        <li
          key={user.socketId}
          className="user-item"
        >
          {user.username}
        </li>
      ))}
    </ul>

    {isHost && (
      <button
        className="start-btn"
        onClick={startQuiz}
      >
        Start Quiz
      </button>
    )}
  </div>
</div>
  );
}