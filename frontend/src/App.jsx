import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("https://codeconnect-by-team-seven.onrender.com");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [copySuccess, setCopySucccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (respose) => {
      setOutPut(respose.run.output);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySucccess("Copied!");
    setTimeout(() => setCopySucccess(""), 2000);
  };

  const handlecodechange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  };

  const generateUniqueId = () => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    setRoomId(uniqueId);
  };

  if (!joined) {
    return (
      <div className="join">
        <header>
          <h2 className="logo">
            <b className="c">C</b>ode<b className="c">C</b>onnect
          </h2>
          <nav className="navigation">
            <a href="#">
              <b>About</b>
            </a>
            <a href="#">
              <b>Developers</b>
            </a>
          </nav>
        </header>
        <div className="join-cointainer">
          <div className="join-form">
            <h1>Code-Room</h1>
            <input
              className="rid"
              type="text"
              placeholder="Room Id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />

            <input
              className="nm"
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
            <a className="uid" onClick={generateUniqueId}>
              Generate unique room id.
            </a>
          </div>
        </div>
        <footer>Developed & Maintained by Team-Seven © 2025</footer>
      </div>
    );
  }
  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Room ID:</h2>
          <p className="rd">{roomId}</p>
          <button onClick={copyRoomId} className="copy-button">
            Copy Room Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.slice(0, 8)}</li>
          ))}
        </ul>
        <h3>Select Language:</h3>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">javascript</option>
          <option value="python">python</option>
          <option value="java">java</option>
          <option value="cpp">C++</option>
        </select>
        <button className="run-btn" onClick={runCode}>
          <b>Run</b>
        </button>
        <p className="typing-indicator">{typing}</p>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="editor-wrapper">
        <Editor
          height={"70%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handlecodechange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontsize: 15,
          }}
        />
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );
};

export default App;
console.log("Socket connected to: ", socket);
