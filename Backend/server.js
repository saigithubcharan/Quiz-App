const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Quiz Backend Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};
const scores = {};

const questions = [
  {
    id: 1,
    question: "What is React?",
    optionA: "Library",
    optionB: "Database",
    optionC: "Operating System",
    optionD: "Programming Language",
    correctAnswer: "Library",
  },
  {
    id: 2,
    question: "What is Node.js?",
    optionA: "Framework",
    optionB: "Runtime Environment",
    optionC: "Database",
    optionD: "IDE",
    correctAnswer: "Runtime Environment",
  },
  {
    id: 3,
    question: "Which company created React?",
    optionA: "Google",
    optionB: "Microsoft",
    optionC: "Meta",
    optionD: "Amazon",
    correctAnswer: "Meta",
  },
];

pool
  .query("SELECT NOW()")
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.log(err));

async function startQuestion(roomId) {
  const room = rooms[roomId];

  if (!room) return;

  const currentQuestion =
    questions[room.currentQuestionIndex];

  let timeLeft = 10;

  room.submittedUsers = {};

  io.to(roomId).emit("quiz-started", {
    question: currentQuestion,
    questionNumber:
      room.currentQuestionIndex + 1,
    totalQuestions: questions.length,
  });

  io.to(roomId).emit(
    "timer-update",
    timeLeft
  );

  const interval = setInterval(async () => {
    timeLeft--;

    io.to(roomId).emit(
      "timer-update",
      timeLeft
    );

    if (timeLeft <= 0) {
      clearInterval(interval);

      io.to(roomId).emit("question-ended", {
        correctAnswer:
          currentQuestion.correctAnswer,
      });

      room.currentQuestionIndex++;

      if (
        room.currentQuestionIndex <
        questions.length
      ) {
        setTimeout(() => {
          startQuestion(roomId);
        }, 3000);
      } else {
        const leaderboard =
          room.users.map((user) => ({
            username: user.username,
            score:
              scores[roomId][
                user.socketId
              ] || 0,
          }));

        leaderboard.sort(
          (a, b) => b.score - a.score
        );

        try {
          for (const player of leaderboard) {
            await pool.query(
              `
              INSERT INTO quiz_results
              (username, score)
              VALUES ($1, $2)
              `,
              [
                player.username,
                player.score,
              ]
            );
          }

          console.log(
            "Quiz results saved"
          );
        } catch (error) {
          console.error(error);
        }

        io.to(roomId).emit(
          "quiz-finished",
          {
            leaderboard,
          }
        );
      }
    }
  }, 1000);
}

io.on("connection", (socket) => {
  console.log(
    "User Connected:",
    socket.id
  );

  socket.on(
    "create-room",
    async ({ username }) => {
      try {
        const roomId = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        rooms[roomId] = {
          host: socket.id,
          users: [
            {
              socketId: socket.id,
              username,
            },
          ],
          currentQuestionIndex: 0,
          submittedUsers: {},
        };

        scores[roomId] = {};
        scores[roomId][socket.id] = 0;

        await pool.query(
          `
          INSERT INTO rooms
          (room_code)
          VALUES ($1)
          `,
          [roomId]
        );

        await pool.query(
          `
          INSERT INTO users
          (username, room_code)
          VALUES ($1, $2)
          `,
          [username, roomId]
        );

        socket.join(roomId);

        socket.emit("room-created", {
          roomId,
          users: rooms[roomId].users,
          host: socket.id,
        });

        io.to(roomId).emit(
          "users-updated",
          rooms[roomId].users
        );

        console.log(
          "Room Created:",
          roomId
        );
      } catch (error) {
        console.error(error);
      }
    }
  );

  socket.on(
    "join-room",
    async ({ roomId, username }) => {
      try {
        if (!rooms[roomId]) {
          socket.emit(
            "error-message",
            "Room not found"
          );
          return;
        }

        socket.join(roomId);

        rooms[roomId].users.push({
          socketId: socket.id,
          username,
        });

        scores[roomId][socket.id] = 0;

        await pool.query(
          `
          INSERT INTO users
          (username, room_code)
          VALUES ($1, $2)
          `,
          [username, roomId]
        );

        socket.emit("joined-room", {
          roomId,
          host: rooms[roomId].host,
        });

        io.to(roomId).emit(
          "users-updated",
          rooms[roomId].users
        );
      } catch (error) {
        console.error(error);
      }
    }
  );

  socket.on(
    "start-quiz",
    ({ roomId }) => {
      startQuestion(roomId);
    }
  );

  socket.on(
    "submit-answer",
    ({ roomId, answer }) => {
      const room = rooms[roomId];

      if (!room) return;

      if (
        room.submittedUsers[socket.id]
      ) {
        return;
      }

      room.submittedUsers[
        socket.id
      ] = true;

      const currentQuestion =
        questions[
          room.currentQuestionIndex
        ];

      if (
        answer ===
        currentQuestion.correctAnswer
      ) {
        scores[roomId][socket.id] += 10;
      }

      console.log(
        "Answer:",
        answer
      );

      console.log(
        "Scores:",
        scores[roomId]
      );
    }
  );

  socket.on("disconnect", () => {
    console.log(
      "Disconnected:",
      socket.id
    );

    Object.keys(rooms).forEach(
      (roomId) => {
        rooms[roomId].users =
          rooms[roomId].users.filter(
            (user) =>
              user.socketId !== socket.id
          );

        io.to(roomId).emit(
          "users-updated",
          rooms[roomId].users
        );

        if (
          scores[roomId] &&
          scores[roomId][socket.id]
        ) {
          delete scores[roomId][socket.id];
        }
      }
    );
  });
});
// console.log("DB URL:", process.env.DATABASE_URL);
// server.listen(5000, () => {
//   console.log(
//     "Server running on port 5000"
//   );
// });
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});