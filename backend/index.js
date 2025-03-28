import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";

const app = express();

const server = http.createServer(app);

const url = `https://codeconnect-by-team-seven.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloded");
    })
    .catch((error) => {
      console.error(`Error : ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);
    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));

    // Send current output to new user
    const room = rooms.get(roomId);
    if (room.output) {
      socket.emit("codeResponse", { run: { output: room.output } });
    }
  });
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);

      // Map language names to Piston API format
      const languageMap = {
        javascript: "nodejs",
        typescript: "typescript",
        python: "python",
        java: "java",
        cpp: "cpp",
        c: "c",
        csharp: "csharp",
        go: "go",
        rust: "rust",
        ruby: "ruby",
        php: "php",
        swift: "swift",
        kotlin: "kotlin",
      };

      // Map versions to Piston API format
      const versionMap = {
        javascript: "18.17.0",
        typescript: "5.0.4",
        python: "3.10.0",
        java: "17.0.2",
        cpp: "12.2.0",
        c: "12.2.0",
        csharp: "7.0.100",
        go: "1.20.5",
        rust: "1.70.0",
        ruby: "3.2.2",
        php: "8.2.7",
        swift: "5.8.1",
        kotlin: "1.8.20",
      };

      // Get file extension based on language
      const getFileExtension = (lang) => {
        const extensions = {
          javascript: ".js",
          typescript: ".ts",
          python: ".py",
          java: ".java",
          cpp: ".cpp",
          c: ".c",
          csharp: ".cs",
          go: ".go",
          rust: ".rs",
          ruby: ".rb",
          php: ".php",
          swift: ".swift",
          kotlin: ".kt",
        };
        return extensions[lang] || ".txt";
      };

      try {
        const response = await axios.post(
          "https://emkc.org/api/v2/piston/execute",
          {
            language: languageMap[language] || language,
            version: versionMap[language] || version,
            files: [
              {
                name: `main${getFileExtension(language)}`,
                content: code,
              },
            ],
          }
        );
        room.output = response.data.run.output;
        io.to(roomId).emit("codeResponse", response.data);
      } catch (error) {
        console.error("Compilation error:", error);
        io.to(roomId).emit("codeResponse", {
          run: {
            output: `Error: ${error.response?.data?.message || error.message}`,
          },
        });
      }
    }
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("user Disconnected");
  });
});
const port = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log("server is working on port 5000");
});
