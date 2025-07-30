import React, { useState, useEffect } from "react";
import "./App.css";

// --- Color/Theme Constants ---
const COLORS = {
  accent: "#ffd600",
  primary: "#1976d2",
  secondary: "#424242",
  lightBg: "#f8f9fa",
  white: "#fff",
  text: "#282c34"
};

// Helper to get persisted session score (localStorage)
function getInitialSessionScore() {
  try {
    const saved = localStorage.getItem("tictactoe-session-score");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { playerX: 0, playerO: 0, draws: 0 };
}

// PUBLIC_INTERFACE
function App() {
  // Game State: 0..8 board, nextPlayer, mode, status, history
  const [board, setBoard] = useState(Array(9).fill(null));
  const [nextPlayer, setNextPlayer] = useState("X");
  const [gameActive, setGameActive] = useState(true);
  // "pvp" (Player vs Player), "cpu" (Player vs Computer)
  const [mode, setMode] = useState("pvp");
  const [status, setStatus] = useState("Your move, X!");
  // session score
  const [score, setScore] = useState(getInitialSessionScore);

  // When mode changes, reset game
  useEffect(() => {
    handleRestart();
    // eslint-disable-next-line
  }, [mode]);

  // Persist score in local storage
  useEffect(() => {
    localStorage.setItem("tictactoe-session-score", JSON.stringify(score));
  }, [score]);

  // On each move or game conclusion, recalculate status
  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      setGameActive(false);
      setStatus(
        winner === "D"
          ? "It's a draw!"
          : `Player ${winner} wins!`
      );
      if (winner === "D") {
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
      } else if (winner === "X") {
        setScore((s) => ({ ...s, playerX: s.playerX + 1 }));
      } else {
        setScore((s) => ({ ...s, playerO: s.playerO + 1 }));
      }
    } else if (board.includes(null)) {
      setStatus(
        mode === "cpu" && nextPlayer === "O"
          ? "Computer thinking..."
          : `Your move, ${nextPlayer}!`
      );
    }
  }, [board, nextPlayer, mode]);

  // Computer move logic (basic AI: win, block, center, random)
  useEffect(() => {
    if (mode === "cpu" && nextPlayer === "O" && gameActive) {
      const timer = setTimeout(() => {
        const move = getComputerMove(board, "O");
        handleCellClick(move);
      }, 450); // delay simulating "thinking"
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [nextPlayer, gameActive, mode]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (!gameActive || board[idx]) return;
    // Block if player clicks during CPU move
    if (mode === "cpu" && nextPlayer === "O") return;

    const newBoard = board.slice();
    newBoard[idx] = nextPlayer;
    setBoard(newBoard);

    const winner = calculateWinner(newBoard);
    if (!winner) {
      setNextPlayer((prev) => (prev === "X" ? "O" : "X"));
    }
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setNextPlayer("X");
    setGameActive(true);
    setStatus("Your move, X!");
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    setMode(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleResetScore() {
    setScore({ playerX: 0, playerO: 0, draws: 0 });
  }

  // --- Render Helpers ---

  function renderCell(i) {
    return (
      <button
        className="ttt-cell"
        aria-label={`Cell ${i + 1}`}
        onClick={() => handleCellClick(i)}
        disabled={!!board[i] || !gameActive || (mode === "cpu" && nextPlayer === "O")}
        style={{
          color:
            board[i] === "X"
              ? COLORS.primary
              : board[i] === "O"
              ? COLORS.secondary
              : COLORS.text
        }}
      >
        {board[i]}
      </button>
    );
  }

  // MAIN RENDER
  return (
    <div className="ttt-outer">
      <div className="ttt-container">
        <h1 className="ttt-title" style={{ color: COLORS.primary }}>
          Tic Tac Toe
        </h1>
        {/* Controls */}
        <div className="ttt-controls">
          <div className="ttt-mode-select">
            <label htmlFor="ttt-mode" className="ttt-label">
              Game Mode:
            </label>
            <select
              id="ttt-mode"
              value={mode}
              onChange={handleModeChange}
              className="ttt-select"
              aria-label="Select Game Mode"
            >
              <option value="pvp">Player vs Player</option>
              <option value="cpu">Player vs Computer</option>
            </select>
          </div>
          <button className="ttt-btn accent" onClick={handleRestart}>
            Restart Game
          </button>
        </div>
        {/* Game Grid */}
        <div className="ttt-board-wrapper">
          <div className="ttt-board">
            {Array(3)
              .fill(0)
              .map((_, r) => (
                <div className="ttt-row" key={r}>
                  {Array(3)
                    .fill(0)
                    .map((_, c) => renderCell(r * 3 + c))}
                </div>
              ))}
          </div>
        </div>
        {/* Status & Scoreboard */}
        <div className="ttt-info-container">
          <div className="ttt-status" style={{ color: COLORS.accent }}>
            <strong>{status}</strong>
          </div>
          <div className="ttt-scoreboard">
            <div className="ttt-score-tile">
              <span
                className="ttt-score-label"
                style={{ color: COLORS.primary }}
              >
                X
              </span>
              <span className="ttt-score-value">{score.playerX}</span>
            </div>
            <div className="ttt-score-tile">
              <span
                className="ttt-score-label"
                style={{ color: COLORS.secondary }}
              >
                O
              </span>
              <span className="ttt-score-value">{score.playerO}</span>
            </div>
            <div className="ttt-score-tile">
              <span
                className="ttt-score-label"
                style={{ color: COLORS.accent }}
              >
                Draws
              </span>
              <span className="ttt-score-value">{score.draws}</span>
            </div>
            <button
              className="ttt-btn ttt-btn-reset"
              onClick={handleResetScore}
              tabIndex={0}
            >
              Reset Score
            </button>
          </div>
        </div>
      </div>
      {/* Footer small print for mobile */}
      <div className="ttt-footer">
        <span>
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with React
          </a>
        </span>
      </div>
    </div>
  );
}

// --- Game Logic ---

// PUBLIC_INTERFACE
function calculateWinner(board) {
  const lines = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diags
    [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }
  if (board.every((cell) => cell)) return "D"; // Draw
  return null;
}

// PUBLIC_INTERFACE
function getComputerMove(board, cpuMark) {
  // cpuMark: 'O', playerMark: 'X'
  const playerMark = cpuMark === "O" ? "X" : "O";
  // 1. WIN: If can win, win
  for (let i = 0; i < 9; ++i) {
    if (!board[i]) {
      const boardCopy = board.slice();
      boardCopy[i] = cpuMark;
      if (calculateWinner(boardCopy) === cpuMark) return i;
    }
  }
  // 2. BLOCK: If player can win, block
  for (let i = 0; i < 9; ++i) {
    if (!board[i]) {
      const boardCopy = board.slice();
      boardCopy[i] = playerMark;
      if (calculateWinner(boardCopy) === playerMark) return i;
    }
  }
  // 3. Take Center
  if (!board[4]) return 4;
  // 4. Random of available
  const empty = [];
  for (let i = 0; i < 9; ++i) if (!board[i]) empty.push(i);
  return empty[Math.floor(Math.random() * empty.length)];
}

export default App;
