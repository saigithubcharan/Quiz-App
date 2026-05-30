// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");

// export default socket;
import { io } from "socket.io-client";

const socket = io(
  "https://splendid-quietude-production-171f.up.railway.app"
);

export default socket;