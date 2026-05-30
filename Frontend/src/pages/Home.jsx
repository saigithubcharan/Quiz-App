import React, { useState, useEffect } from "react";
import socket from "../socket";
import Lobby from "./Lobby";
import Quiz from "./Quiz";
import "./Home.css"

export default function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [users, setUsers] = useState([]);
  const [joinRoomId, setJoinRoomId] = useState("");

  const [isHost, setIsHost] = useState(false);

  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(10);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionEnded, setQuestionEnded] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1);

  useEffect(() => {
    socket.on("room-created", (data) => {
      setRoomId(data.roomId);
      setUsers(data.users);
      setIsHost(true);
    });

    socket.on("joined-room", (data) => {
      setRoomId(data.roomId);
      setIsHost(false);
    });

    socket.on("users-updated", (users) => {
      setUsers(users);
    });

    socket.on("quiz-started", (data) => {
      setQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);

      setQuestionEnded(false);
      setCorrectAnswer("");
    });

    socket.on("timer-update", (time) => {
      setTimer(time);
    });

    socket.on("question-ended", (data) => {
      setCorrectAnswer(data.correctAnswer);
      setQuestionEnded(true);
    });

    socket.on("quiz-finished", (data) => {
      setLeaderboard(data.leaderboard);
      setQuizFinished(true);
    });

    return () => {
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("users-updated");
      socket.off("quiz-started");
      socket.off("timer-update");
      socket.off("question-ended");
      socket.off("quiz-finished");
    };
  }, []);

  const createRoom = () => {
    if (!username) return;

    socket.emit("create-room", {
      username,
    });
  };

  const joinRoom = () => {
    if (!username || !joinRoomId) return;

    socket.emit("join-room", {
      roomId: joinRoomId,
      username,
    });
  };

  const startQuiz = () => {
    socket.emit("start-quiz", {
      roomId,
    });
  };

if (quizFinished) {
  return (
    <div className="result-container">
      <div className="result-card">

        <div className="trophy">
          🏆
        </div>

        <h1 className="leaderboard-title">
          Final Leaderboard
        </h1>

        <ul className="leaderboard-list">
          {leaderboard.map((player, index) => (
            <li
              key={index}
              className={`leaderboard-item ${
                index === 0
                  ? "rank-1"
                  : index === 1
                  ? "rank-2"
                  : index === 2
                  ? "rank-3"
                  : ""
              }`}
            >
              <span className="player-name">
                #{index + 1} {player.username}
              </span>

              <span className="player-score">
                {player.score} pts
              </span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

if (questionEnded) {
  return (
    <div className="result-container">
      <div className="result-card">
        <h1 className="result-title">
          ✅ Question Finished
        </h1>

        <div className="correct-answer">
          Correct Answer is : {correctAnswer}
        </div>

        <div className="next-question">
          Next Question Starting...
        </div>
      </div>
    </div>
  );
}

  if (question) {
    return (
      <div>
        <h3>
          Question {questionNumber} of {totalQuestions}
        </h3>

        <Quiz
          question={question}
          timer={timer}
          onSubmitAnswer={(answer) => {
            socket.emit("submit-answer", {
              roomId,
              answer,
            });
          }}
        />
      </div>
    );
  }

  if (roomId) {
    return (
      <Lobby
        roomId={roomId}
        users={users}
        isHost={isHost}
        startQuiz={startQuiz}
      />
    );
  }

 return (
  <div className="home-container">
    <div className="home-card">
      <h1 className="home-title">
        Real Time Quiz App
      </h1>

      <input
        className="home-input"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <button
        className="home-btn"
        onClick={createRoom}
      >
        Create Room
      </button>

      <input
        className="home-input"
        placeholder="Room ID"
        value={joinRoomId}
        onChange={(e) =>
          setJoinRoomId(e.target.value)
        }
      />

      <button
        className="home-btn"
        onClick={joinRoom}
      >
        Join Room
      </button>
    </div>
  </div>
);
}