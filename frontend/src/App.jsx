import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Toaster, toast } from "react-hot-toast";

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
      toast.success("Language Updated");
    });

    socket.on("codeResponse", (respose) => {
      setOutPut(respose.run.output);
      toast.success("Code executed successfully");
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
      setCode(
        "// Team-Seven: JavaScript-coding the web, one elegant line at a time.\nfunction Connect() {\n  console.log('Hello, Devs!');\n}\nConnect();"
      ); //default code snippet
      toast.success("" + userName + " joined 🤝");
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("");
    setLanguage("javascript");
    toast.success("" + userName + " Left 👋");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard📋");
    setTimeout(() => toast.dismiss(), 2000);
  };

  const handlecodechange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    const defaultCodeSnippets = {
      javascript:
        "// Team-Seven: JavaScript-coding the web, one elegant line at a time.\nfunction Connect() {\n  console.log('Hello, Devs!');\n}\nConnect();",

      python:
        "# Team_Seven: Python-scripting dreams, one line at a time.\nprint('Hello, Devs!')",

      java: '// Team_Seven: Java - engineering excellence, one line at a time.\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Devs!");\n  }\n}',

      c: '// Team_Seven: C – crafting efficient code, one line at a time.\nint main() {\n  printf("Hello, Devs!");\n  return 0;\n}',

      cpp: '// Team_Seven: C++ – where precision meets power, line by line.\n#include <iostream>\nusing namespace std;\nint main() {\n  std::cout << "Hello, Devs!" << std::endl;\n  return 0;\n}',

      csharp:
        '// Team_Seven: C# – orchestrating code, elegantly.\nusing System;\nclass MainClass {\n  public static void Main(string[] args) {\n    Console.WriteLine("Hello, Devs!");\n  }\n}',

      go: '// Team_Seven: Go – powering efficiency, one line at a time.\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, Devs!")\n}',
    };

    setLanguage(newLanguage);
    setCode(defaultCodeSnippets[newLanguage] || "");

    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
    toast.success("Code Running...");
  };

  const generateUniqueId = () => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    setRoomId(uniqueId);
    toast.success("Room Id Generated!");
  };

  if (!joined) {
    return (
      <div className="join">
        <Toaster position="top-center" reverseOrder={false} />
        <header>
          <h2 className="logo">
            <b className="c">C</b>ode<b className="c">C</b>onnect
          </h2>
          <nav className="navigation">
            <a href="https://github.com/Pabitra-Sahoo/CodeConnect">
              <b>About</b>
            </a>
            <a href="https://pabitra-sahoo.github.io/Code-Connect-Team/">
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
              required
              autoComplete="off"
            />

            <input
              className="nm"
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="off"
            />
            <button onClick={joinRoom}>Join Room</button>
            <a className="msg">don't have a room id? </a>
            <a className="uid" onClick={generateUniqueId}>
              Click here
            </a>
          </div>
        </div>
        <footer>Developed & Maintained by Team-Seven © 2025</footer>
      </div>
    );
  }
  return (
    <div className="editor-container">
      <Toaster position="top-center" reverseOrder={false} />
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

        <div className="scroll-bg">
          <div className="scroll-div">
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user.slice(0, 15)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="type">
          {" "}
          <p className="typing-indicator">{typing}</p>
        </div>

        <h3 className="lang">Select Language:</h3>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
        </select>
        <button className="run-btn" onClick={runCode}>
          <b>Run</b>
        </button>
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
