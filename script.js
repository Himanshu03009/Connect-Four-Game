const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayerIndex = 0;
let level = 1;
let score = 0;
let timer;
let timeLeft = 30;
let gameActive = true;
let soundEnabled = true;

const playerColors = ['red', 'yellow', 'green', 'blue', 'purple'];
let currentColors = ['red', 'yellow']; // Start with 2

// Sound effects
const clickSound = new Audio("sound/clickSound.mp3");
const winSound = new Audio("sound/winSound.mp3");

function playSound(sound) {
  const clone = sound.cloneNode();
  clone.play().catch(e => console.log("Sound play error:", e));
}

// DOM elements
const boardEl = document.getElementById("board");
const levelDisplay = document.getElementById("levelDisplay");
const turnDisplay = document.getElementById("currentPlayerColor");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const muteBtn = document.getElementById("muteBtn");
const resetLevelBtn = document.getElementById("resetLevelBtn");
const sparkleCanvas = document.getElementById("sparkleCanvas");
const ctx = sparkleCanvas.getContext("2d");

function createBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", handleCellClick);
      boardEl.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  if (!gameActive) return;
  if (soundEnabled) playSound(clickSound);

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (board[row][col] === "") {
    const currentColor = currentColors[currentPlayerIndex];
    board[row][col] = currentColor;
    const disc = document.createElement("div");
    disc.classList.add("disc", currentColor);
    e.target.appendChild(disc);

    if (checkWin(row, col)) {
      gameActive = false;
      score++;
      showWinEffect();
      message.innerText = `Player ${currentColor.toUpperCase()} wins Level ${level}!`;
      if (soundEnabled) playSound(winSound);

      setTimeout(() => {
        if (level < 10) {
          level++;
          initLevel();
        } else {
          message.innerText = "Game Over! You completed all levels.";
          resetBtn.innerText = "🔁 Play Again";
          gameActive = false;
        }
      }, 2500);
    } else if (checkDraw()) {
      message.innerText = `Level ${level} Draw!`;
      gameActive = false;
      setTimeout(() => {
        initLevel();
      }, 1500);
    } else {
      currentPlayerIndex = (currentPlayerIndex + 1) % currentColors.length;
      updateUI();
    }
  }
}

function checkWin(row, col) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  const player = board[row][col];

  for (let [dx, dy] of directions) {
    let count = 1;
    count += countDiscs(row, col, dx, dy, player);
    count += countDiscs(row, col, -dx, -dy, player);
    if (count >= 4) return true;
  }
  return false;
}

function countDiscs(row, col, dx, dy, player) {
  let count = 0;
  let r = row + dx;
  let c = col + dy;
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++;
    r += dx;
    c += dy;
  }
  return count;
}

function checkDraw() {
  return board.every(row => row.every(cell => cell !== ""));
}

function initLevel() {
  gameActive = true;
  message.innerText = "";
  timeLeft = 30;

  // Increase number of active player colors with level
  const colorCount = Math.min(2 + level - 1, playerColors.length);
  currentColors = playerColors.slice(0, colorCount);
  currentPlayerIndex = 0;

  createBoard();
  updateUI();
  startTimer();
}

function updateUI() {
  levelDisplay.innerText = `Level: ${level}`;
  scoreDisplay.innerText = `Score: ${score}`;
  turnDisplay.className = `player-indicator ${currentColors[currentPlayerIndex]}`;
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    timerDisplay.innerText = `⏱️ Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameActive = false;
      message.innerText = `⏳ Time Up! Level ${level} Draw!`;
      setTimeout(() => {
        initLevel();
      }, 1500);
    }
  }, 1000);
}

resetBtn.addEventListener("click", () => {
  level = 1;
  score = 0;
  resetBtn.innerText = "🔄 Reset Game";
  initLevel();
});

resetLevelBtn.addEventListener("click", () => {
  if (gameActive || checkDraw()) {
    message.innerText = "Level Reset!";
    initLevel();
  }
});

muteBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  muteBtn.innerText = soundEnabled ? "🔊 Mute" : "🔇 Unmute";
});

function showWinEffect() {
  sparkleCanvas.style.display = "block";
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;

  const sparks = Array.from({ length: 50 }, () => ({
    x: Math.random() * sparkleCanvas.width,
    y: Math.random() * sparkleCanvas.height,
    radius: Math.random() * 3 + 2,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    dx: (Math.random() - 0.5) * 8,
    dy: (Math.random() - 0.5) * 8
  }));

  let count = 0;
  const anim = setInterval(() => {
    ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    sparks.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      s.x += s.dx;
      s.y += s.dy;
    });
    if (++count > 30) {
      clearInterval(anim);
      sparkleCanvas.style.display = "none";
    }
  }, 60);
}

initLevel();
