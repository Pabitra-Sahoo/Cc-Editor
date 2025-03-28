import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Toaster, toast } from "react-hot-toast";

const socket = io("https://codeconnect-by-team-seven.onrender.com");

/**
 * Main App Component
 * Handles the core functionality of the collaborative code editor
 * Manages user sessions, real-time collaboration, and code execution
 */
const App = () => {
  /**
   * State Management
   * joined: Tracks if user has joined a room
   * roomId: Stores the current room identifier
   * userName: Current user's display name
   * language: Selected programming language
   * code: Current code content in editor
   * users: List of active users in room
   * typing: Shows which user is currently typing
   * outPut: Stores code execution results
   * showMobileMenu: Controls mobile menu visibility
   * showUsersSidebar: Controls users sidebar visibility
   * editorTheme: Current editor color theme
   * wordWrapEnabled: Controls word wrap in editor
   * isLoading: Indicates loading state during operations
   * prevUsers: Tracks previous user list for notifications
   */
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUsersSidebar, setShowUsersSidebar] = useState(false);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [wordWrapEnabled, setWordWrapEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevUsers, setPrevUsers] = useState([]);

  /**
   * Theme Management
   * Defines and registers custom editor themes
   * Includes: GitHub Light/Dark, Monokai, Dracula, Nord, Solarized Light/Dark
   * @param {Object} monaco - Monaco editor instance
   */
  const defineCustomThemes = (monaco) => {
    // GitHub theme (light)
    monaco.editor.defineTheme("github-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a737d" },
        { token: "keyword", foreground: "d73a49" },
        { token: "string", foreground: "032f62" },
        { token: "number", foreground: "005cc5" },
        { token: "type", foreground: "6f42c1" },
      ],
      colors: {
        "editor.foreground": "#24292e",
        "editor.background": "#ffffff",
        "editor.selectionBackground": "#b0d6ff",
        "editor.lineHighlightBackground": "#f1f8ff",
        "editorCursor.foreground": "#24292e",
        "editorWhitespace.foreground": "#999999",
      },
    });

    // GitHub Dark theme
    monaco.editor.defineTheme("github-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a737d" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "string", foreground: "a5d6ff" },
        { token: "number", foreground: "79c0ff" },
        { token: "type", foreground: "d2a8ff" },
      ],
      colors: {
        "editor.foreground": "#c9d1d9",
        "editor.background": "#0d1117",
        "editor.selectionBackground": "#3b5070",
        "editor.lineHighlightBackground": "#161b22",
        "editorCursor.foreground": "#c9d1d9",
        "editorWhitespace.foreground": "#484f58",
      },
    });

    // Monokai theme
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "75715e" },
        { token: "keyword", foreground: "f92672" },
        { token: "string", foreground: "e6db74" },
        { token: "number", foreground: "ae81ff" },
        { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      ],
      colors: {
        "editor.foreground": "#f8f8f2",
        "editor.background": "#272822",
        "editor.selectionBackground": "#49483e",
        "editor.lineHighlightBackground": "#3e3d32",
        "editorCursor.foreground": "#f8f8f0",
        "editorWhitespace.foreground": "#49483e",
      },
    });

    // Dracula theme
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
      ],
      colors: {
        "editor.foreground": "#f8f8f2",
        "editor.background": "#282a36",
        "editor.selectionBackground": "#44475a",
        "editor.lineHighlightBackground": "#44475a",
        "editorCursor.foreground": "#f8f8f0",
        "editorWhitespace.foreground": "#6272a4",
      },
    });

    // Nord theme
    monaco.editor.defineTheme("nord", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "4c566a" },
        { token: "keyword", foreground: "81a1c1" },
        { token: "string", foreground: "a3be8c" },
        { token: "number", foreground: "b48ead" },
        { token: "type", foreground: "88c0d0" },
      ],
      colors: {
        "editor.foreground": "#d8dee9",
        "editor.background": "#2e3440",
        "editor.selectionBackground": "#434c5e",
        "editor.lineHighlightBackground": "#3b4252",
        "editorCursor.foreground": "#d8dee9",
        "editorWhitespace.foreground": "#4c566a",
      },
    });

    // Solarized Light theme
    monaco.editor.defineTheme("solarized-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "93a1a1" },
        { token: "keyword", foreground: "268bd2" },
        { token: "string", foreground: "2aa198" },
        { token: "number", foreground: "d33682" },
        { token: "type", foreground: "6c71c4" },
      ],
      colors: {
        "editor.foreground": "#657b83",
        "editor.background": "#fdf6e3",
        "editor.selectionBackground": "#eee8d5",
        "editor.lineHighlightBackground": "#eee8d5",
        "editorCursor.foreground": "#657b83",
        "editorWhitespace.foreground": "#93a1a1",
      },
    });

    // Solarized Dark theme
    monaco.editor.defineTheme("solarized-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "586e75" },
        { token: "keyword", foreground: "268bd2" },
        { token: "string", foreground: "2aa198" },
        { token: "number", foreground: "d33682" },
        { token: "type", foreground: "6c71c4" },
      ],
      colors: {
        "editor.foreground": "#93a1a1",
        "editor.background": "#002b36",
        "editor.selectionBackground": "#073642",
        "editor.lineHighlightBackground": "#073642",
        "editorCursor.foreground": "#93a1a1",
        "editorWhitespace.foreground": "#586e75",
      },
    });
  };

  /**
   * Editor Initialization
   * Registers custom themes before Monaco editor mounts
   * @param {Object} monaco - Monaco editor instance
   */
  const handleEditorBeforeMount = (monaco) => {
    defineCustomThemes(monaco);
  };

  /**
   * Mobile Menu Toggle
   * Controls the visibility of mobile menu
   * Closes users sidebar when menu opens on mobile
   */
  const toggleMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    // Close users sidebar when opening mobile menu on phone screens
    if (window.innerWidth <= 768) {
      setShowUsersSidebar(false);
    }
  };

  /**
   * Users Sidebar Toggle
   * Controls the visibility of users list sidebar
   * Closes mobile menu when sidebar opens on mobile
   */
  const toggleUsersSidebar = () => {
    setShowUsersSidebar(!showUsersSidebar);
    // Close mobile menu when opening users sidebar on phone screens
    if (window.innerWidth <= 768) {
      setShowMobileMenu(false);
    }
  };

  /**
   * Socket Event Handlers
   * Manages real-time collaboration features:
   * - User join/leave notifications
   * - Code synchronization
   * - Typing indicators
   * - Language updates
   * - Code execution responses
   */
  useEffect(() => {
    socket.on("userJoined", (users) => {
      // Only show notification for existing users
      if (prevUsers.length > 0 && prevUsers.includes(userName)) {
        const newUsers = users.filter((user) => !prevUsers.includes(user));
        if (newUsers.length > 0) {
          const newUser = newUsers[0];
          toast.success(`${newUser} joined the room! 🤝`);
        }
      }
      setUsers(users);
      setPrevUsers(users);
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

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
      setIsLoading(false);
      toast.success("Code executed successfully");
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, [userName, prevUsers]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (joined) {
        socket.emit("leaveRoom", { roomId, userName });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [joined, roomId, userName]);

  /**
   * Room Join Handler
   * Validates input and establishes socket connection
   * Updates room state and notifies other users
   */
  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
      setCode("");
      setOutPut("");
      toast.success(`Welcome to CodeConnect, ${userName}! 👋`);
      setPrevUsers([userName]);
    }
  };

  /**
   * Room Exit Handler
   * Cleans up socket connections
   * Resets application state
   * Notifies other users
   */
  const leaveRoom = () => {
    if (window.confirm("Are you sure you want to leave this room?")) {
      const userLeaving = userName; // Store the username before clearing state

      // Emit leave event with both roomId and userName
      socket.emit("leaveRoom", { roomId, userName: userLeaving });

      // Clear all states
      setJoined(false);
      setRoomId("");
      setUserName("");
      setCode("");
      setLanguage("javascript");
      setShowMobileMenu(false);
      setShowUsersSidebar(false);
      setPrevUsers([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  /**
   * Room ID Copy Handler
   * Copies room ID to clipboard
   * Shows success notification
   */
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard📋");
    setTimeout(() => toast.dismiss(), 2000);
  };

  /**
   * Code Change Handler
   * Syncs code changes with other users
   * Triggers typing notifications
   * @param {string} newCode - Updated code content
   */
  const handlecodechange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  /**
   * Language Change Handler
   * Updates editor language
   * Notifies other users of change
   * @param {Event} e - Change event
   */
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode("");
    socket.emit("languageChange", { roomId, language: newLanguage });
    socket.emit("codeChange", { roomId, code: "" });
  };

  /**
   * Code Execution Handler
   * Sends code to server for execution
   * Updates loading state
   * Displays execution results
   */
  const runCode = () => {
    if (!code || code.trim() === "") {
      toast.error("No code to run!");
      return;
    }
    setIsLoading(true);
    socket.emit("compileCode", { code, roomId, language, version: "*" });
  };

  /**
   * Room ID Generator
   * Creates unique room identifiers
   * @returns {string} Unique room ID
   */
  const generateUniqueId = () => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    setRoomId(uniqueId);
    toast.success("Room Id Generated!");
  };

  /**
   * Terminal Clear Handler
   * Resets output console content
   */
  const clearTerminal = () => {
    setOutPut("");
    toast.success("Terminal cleared");
  };

  /**
   * Theme Change Handler
   * Updates editor color theme
   * @param {Event} e - Change event
   */
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setEditorTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  /**
   * Word Wrap Toggle
   * Enables/disables editor word wrap
   */
  const toggleWordWrap = () => {
    setWordWrapEnabled(!wordWrapEnabled);
    toast.success(wordWrapEnabled ? "Word wrap disabled" : "Word wrap enabled");
  };

  /**
   * Page Unload Handler
   * Performs cleanup before page close
   * Disconnects socket
   * @param {Event} e - BeforeUnload event
   */
  const handleBeforeUnload = (e) => {
    if (joined) {
      socket.emit("leaveRoom", { roomId, userName });
    }
  };

  /**
   * Login Form Component
   * Renders room join interface
   * Handles user input and validation
   */
  const LoginForm = () => {
    // ... existing code ...
  };

  /**
   * Editor Component
   * Renders main code editor interface
   * Includes toolbar, editor, and output console
   */
  const EditorContainer = () => {
    // ... existing code ...
  };

  /**
   * Mobile Menu Component
   * Renders responsive navigation menu
   * Contains room actions and settings
   */
  const MobileMenu = () => {
    // ... existing code ...
  };

  /**
   * Users Sidebar Component
   * Displays list of active users
   * Shows user status and actions
   */
  const UsersSidebar = () => {
    // ... existing code ...
  };

  if (!joined) {
    return (
      <div className="join">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="stars">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                width: Math.random() * 3 + "px",
                height: Math.random() * 3 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDuration: Math.random() * 3 + 2 + "s",
                animationDelay: Math.random() * 2 + "s",
              }}
            />
          ))}
        </div>
        <div className="floating-docs">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="doc-icon"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDuration: Math.random() * 10 + 15 + "s",
                animationDelay: Math.random() * -20 + "s",
              }}
            >
              <div className="doc-inner" />
            </div>
          ))}
        </div>
        <header>
          <div className="logo">
            <div className="logo-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
              </svg>
            </div>
            <span className="logo-text">
              <span className="logo-code">Code</span>
              <span className="logo-connect">Connect</span>
            </span>
          </div>
          <nav className="navigation">
            <a href="https://github.com/Pabitra-Sahoo/CodeConnect">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About
            </a>
            <a href="https://pabitra-sahoo.github.io/Code-Connect-Team/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Developers
            </a>
          </nav>
          <button
            className="hamburger-menu"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Mobile Menu Sidebar for login screen */}
        <div
          className={`mobile-menu-overlay ${showMobileMenu ? "active" : ""}`}
          onClick={toggleMenu}
        ></div>
        <div className={`mobile-menu ${showMobileMenu ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <button className="close-menu" onClick={toggleMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="mobile-header-content">
              <h3>Room Actions</h3>
              <div className="info-icon-container mobile-only">
                <div className="info-icon" title="App Information">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div className="info-tooltip">
                    <h4>CodeConnect Features</h4>
                    <ul>
                      <li>⌨️ Word wrap toggle :(Click main logo)</li>
                      <li>✔️Press enter on last line of code</li>
                      <li>🎨 Multiple editor themes</li>
                      <li>⚠️Change language before use</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <nav className="mobile-navigation">
            <a
              href="https://github.com/Pabitra-Sahoo/CodeConnect"
              onClick={toggleMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "12px" }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About
            </a>
            <a
              href="https://pabitra-sahoo.github.io/Code-Connect-Team/"
              onClick={toggleMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "12px" }}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Developers
            </a>
          </nav>
        </div>

        <div className="join-cointainer">
          <div className="join-form">
            <h1>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="title-icon-left"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Code-Room
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="title-icon-right"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </h1>
            <div className="input-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="input-icon"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              <input
                className="rid"
                type="text"
                placeholder="Room Id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                autoComplete="off"
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="input-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="input-icon"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                className="nm"
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoComplete="off"
                onKeyDown={handleKeyPress}
              />
            </div>
            <button onClick={joinRoom}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="btn-icon"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Join Session
            </button>
            <div className="help-text">
              <a className="msg">don't have a room id? </a>
              <a className="uid" onClick={generateUniqueId}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="generate-icon"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
                Generate ID
              </a>
            </div>
          </div>
        </div>
        <footer>
          <div>
            Made with <span>♥</span> by{" "}
            <a
              href="https://pabitra-sahoo.github.io/Code-Connect-Team/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Team Seven
            </a>{" "}
            • <span>CodeConnect</span> © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    );
  }
  return (
    <div className="editor-container">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="navbar">
        <div className="navbar-left">
          <div
            className="sidebar-logo"
            onClick={toggleWordWrap}
            style={{ cursor: "pointer" }}
            title={wordWrapEnabled ? "Disable word wrap" : "Enable word wrap"}
          >
            <div className="logo-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
              </svg>
            </div>
            <span className="logo-text">
              <span className="logo-code">Code</span>
              <span className="logo-connect">Connect</span>
            </span>
          </div>
          <div className="info-icon-container">
            <div className="info-icon" title="App Information">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="info-tooltip">
                <h4>CodeConnect Features</h4>
                <ul>
                  <li>⌨️ Word wrap toggle (Click main logo)</li>
                  <li>✔️Press enter on last line of code</li>
                  <li>🎨 Multiple editor themes</li>
                  <li>⚠️Change language before use</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          <button
            onClick={copyRoomId}
            className="copy-button"
            title={`Copy Room ID: ${roomId}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Room Id</span>
          </button>

          <button className="leave-button" onClick={leaveRoom}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Leave Room</span>
          </button>

          <button
            className="run-btn"
            onClick={runCode}
            title="Run Code"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLoading ? (
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              ) : (
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              )}
            </svg>
            <span>{isLoading ? "Running..." : "Run Code"}</span>
          </button>

          <div className="language-container">
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
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin experimental</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div className="theme-container">
            <select
              className="theme-selector"
              value={editorTheme}
              onChange={handleThemeChange}
              title="Change editor theme"
            >
              <option value="vs-dark">Dark (Default)</option>
              <option value="vs">Light</option>
              <option value="github-light">GitHub Light</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="monokai">Monokai</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
              <option value="solarized-light">Solarized Light</option>
              <option value="solarized-dark">Solarized Dark</option>
              <option value="hc-black">High Contrast Dark</option>
              <option value="hc-light">High Contrast Light</option>
            </select>
          </div>

          <button
            className="mobile-run-btn"
            onClick={runCode}
            title="Run Code"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLoading ? (
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              ) : (
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              )}
            </svg>
          </button>

          <button
            className="users-toggle-btn"
            onClick={toggleUsersSidebar}
            title="Show/Hide Users"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="user-count">{users.length}</span>
          </button>

          <button
            className="hamburger-menu"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Users Sidebar */}
      <div className={`users-sidebar ${showUsersSidebar ? "active" : ""}`}>
        <div className="users-sidebar-header">
          <h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Users in Room
          </h3>
          <button
            className="close-users-sidebar"
            onClick={toggleUsersSidebar}
            aria-label="Close users sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="users-container">
          <ul>
            {users.map((user, index) => (
              <li key={index} style={{ "--animation-order": index }}>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-overlay ${showMobileMenu ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`mobile-menu ${showMobileMenu ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <button className="close-menu" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="mobile-header-content">
            <h3>Room Actions</h3>
            <div className="info-icon-container mobile-only">
              <div className="info-icon" title="App Information">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div className="info-tooltip">
                  <h4>CodeConnect Features</h4>
                  <ul>
                    <li>⌨️ Word wrap toggle (Click main logo)</li>
                    <li>✔️Press enter on last line of code for sync</li>
                    <li>🎨 Multiple editor themes</li>
                    <li>⚠️Change language before use</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="mobile-navigation">
          <button
            onClick={copyRoomId}
            className="mobile-button copy-button"
            title={`Copy Room ID: ${roomId}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "12px" }}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Room Id
          </button>

          <button className="mobile-button leave-button" onClick={leaveRoom}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "12px" }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Leave Room
          </button>

          <button
            className="mobile-button run-button"
            onClick={runCode}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "12px" }}
            >
              {isLoading ? (
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              ) : (
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              )}
            </svg>
            <span>{isLoading ? "Running..." : "Run"}</span>
          </button>

          <div className="mobile-lang-container">
            <label htmlFor="mobileLangSelect">Select Language:</label>
            <select
              id="mobileLangSelect"
              className="mobile-language-selector"
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
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin Experimental</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div className="mobile-theme-container">
            <label htmlFor="mobileThemeSelect">Select Theme:</label>
            <select
              id="mobileThemeSelect"
              className="mobile-theme-selector"
              value={editorTheme}
              onChange={handleThemeChange}
            >
              <option value="vs-dark">Dark (Default)</option>
              <option value="vs">Light</option>
              <option value="github-light">GitHub Light</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="monokai">Monokai</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
              <option value="solarized-light">Solarized Light</option>
              <option value="solarized-dark">Solarized Dark</option>
              <option value="hc-black">High Contrast Dark</option>
              <option value="hc-light">High Contrast Light</option>
            </select>
          </div>

          <div className="mobile-users-section">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "12px" }}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Users in Room:
            </h3>
            <ul className="mobile-users-list">
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="editor-wrapper">
        <Editor
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handlecodechange}
          theme={editorTheme}
          beforeMount={handleEditorBeforeMount}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            fontFamily: "Poppins, monospace",
            fontLigatures: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            lineHeight: 1.5,
            padding: { top: 15 },
            renderLineHighlight: "all",
            wordWrap: wordWrapEnabled ? "on" : "off",
          }}
        />
        <div className="output-container">
          <div className="output-header">
            <div className="terminal-title-section">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="terminal-icon"
              >
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span>Terminal Output</span>
              {typing && <div className="typing-indicator">{typing}</div>}
            </div>
            <div
              className="clear-terminal"
              onClick={clearTerminal}
              title="Clear terminal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear</span>
            </div>
          </div>
          <textarea
            className="output-console"
            value={outPut}
            readOnly
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

export default App;
