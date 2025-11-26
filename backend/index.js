const express = require("express");
const http = require("http");
const cors = require("cors");
const questionsRoute = require("./routes/questions.route");
const authRoute = require("./routes/auth.route");
const quizRoute = require("./routes/quiz.route");
const connectToMongo = require("./connectDb");
const { initializeSocket } = require("./socket/socket.js");
const { ENV_VARS } = require("./config/envVar.js");

const PORT = ENV_VARS.PORT || 5000;

const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");

// --- CORS FIX ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-prep-app-five.vercel.app",
  "https://interview-prep-app-8cu4.onrender.com"
];

// Express CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Socket.io CORS
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling","websocket"],
});

// Connect DB
connectToMongo();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/questions", questionsRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/rooms", require("./routes/rooms.js"));
app.use("/uploads", express.static("uploads"));

// Initialize socket.io handlers
initializeSocket(io);

// Default route
app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
