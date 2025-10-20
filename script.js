/* ===============================
   Clean Water For All - Game Logic
   =============================== */

// Game state variables
let score = 0;
let timeLeft = 60; // was 30
let gameActive = false;
let spawnInterval, countdownInterval;
let timerInterval = null;

// Game configuration
const MOLE_POPUP_TIME = 1200; // milliseconds (how long mole stays up) - was 1000
const MOLE_SPAWN_RATE = 1400;  // how often new mole appears - was 900

// Select DOM elements
const grid = document.querySelector(".game-grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");

// -------------------------------
// Create the 9-hole grid
// -------------------------------
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    grid.appendChild(cell);
  }
}
createGrid(); // run once on load

// -------------------------------
// Spawn a random mole
// -------------------------------
function spawnMole() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");
  cells.forEach(cell => {
    cell.innerHTML = ""; // clear any existing moles
    cell.classList.remove("active");
  });

  // Pick a random cell
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Decide randomly: 80% mole, 20% water-can
  if (Math.random() < 0.2) {
    // Water-can
    const canWrapper = document.createElement("div");
    canWrapper.classList.add("mole-wrapper");

    const can = document.createElement("div");
    can.classList.add("water-can");
    can.style.backgroundImage = "url('img/water-can.png')"; // Make sure this image exists

    can.addEventListener("click", () => handleWaterCanClick(can));

    canWrapper.appendChild(can);
    randomCell.appendChild(canWrapper);
    randomCell.classList.add("active");

    setTimeout(() => {
      if (randomCell.contains(canWrapper)) {
        randomCell.innerHTML = "";
        randomCell.classList.remove("active");
      }
    }, MOLE_POPUP_TIME);
    return;
  }

  // Mole spawning logic
  const moleWrapper = document.createElement("div");
  moleWrapper.classList.add("mole-wrapper");

  const mole = document.createElement("div");
  mole.classList.add("mole");

  // 50/50 chance for clean or dirty mole
  const isDirty = Math.random() < 0.5;
  mole.classList.add(isDirty ? "dirty" : "clean");

  // Apply mole image (ensure your mole.png is in /img folder)
  mole.style.backgroundImage = "url('img/mole.png')";

  // Add click handler
  mole.addEventListener("click", () => handleMoleClick(isDirty, mole));

  // Assemble and show mole
  moleWrapper.appendChild(mole);
  randomCell.appendChild(moleWrapper);
  randomCell.classList.add("active");

  // Remove mole after popup time
  setTimeout(() => {
    if (randomCell.contains(moleWrapper)) {
      randomCell.innerHTML = "";
      randomCell.classList.remove("active");
    }
  }, MOLE_POPUP_TIME);
}

// -------------------------------
// Handle mole clicks
// -------------------------------
function handleMoleClick(isDirty, mole) {
  if (!gameActive) return;

  // Prevent multiple clicks on same mole
  mole.style.pointerEvents = "none";

  mole.classList.add("hit-effect");

  if (isDirty) {
    score += 10;
    triggerLightningFlash(); // <-- Add this line
  } else {
    score -= 5; // optional penalty for hitting clean mole
  }

  // Update score
  scoreDisplay.textContent = score;

  // Remove mole visually after click
  setTimeout(() => {
    mole.parentElement?.parentElement?.classList.remove("active");
    mole.parentElement?.remove();
  }, 150);
}

// -------------------------------
// Handle water-can clicks
// -------------------------------
function handleWaterCanClick(can) {
  if (!gameActive) return;

  can.style.pointerEvents = "none";
  can.classList.add("hit-effect");

  score -= 10;
  scoreDisplay.textContent = score;
  triggerRedFlash();

  setTimeout(() => {
    can.parentElement?.parentElement?.classList.remove("active");
    can.parentElement?.remove();
  }, 150);
}

// -------------------------------
// Start or Restart Game
// -------------------------------
function startGame() {
  if (gameActive) return;

  // Reset values
  score = 0;
  timeLeft = 60; // was 30
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;

  // Clean up any game-over message
  const oldMessage = document.querySelector(".game-over");
  if (oldMessage) oldMessage.remove();

  gameActive = true;
  createGrid();

  // Start mole spawning
  spawnInterval = setInterval(spawnMole, MOLE_SPAWN_RATE);

  // Countdown timer
  countdownInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// -------------------------------
// End Game
// -------------------------------
function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(countdownInterval);
  clearInterval(timerInterval);

  // Clear any remaining moles
  document.querySelectorAll(".grid-cell").forEach(cell => (cell.innerHTML = ""));

  // Display game-over message
  const gameOver = document.createElement("div");
  gameOver.classList.add("game-over");
  gameOver.textContent = `Game Over! Final Score: ${score}`;
  grid.insertAdjacentElement("afterend", gameOver);
}

// -------------------------------
// Reset Game
// -------------------------------
function resetGame() {
  // Stop all timers/intervals
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reset game state
  score = 0;
  timeLeft = 60; // was 30
  gameActive = false;

  // Update UI
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;

  // Remove any game-over message
  const oldMessage = document.querySelector(".game-over");
  if (oldMessage) oldMessage.remove();

  // Reset the board to its starting point
  createGrid();
}

// -------------------------------
// Lightning flash effect
function triggerLightningFlash() {
  document.body.classList.add('lightning-flash');
  setTimeout(() => {
    document.body.classList.remove('lightning-flash');
  }, 200); // flash duration in ms
}

// -------------------------------
// Red flash effect for water-can
function triggerRedFlash() {
  document.body.classList.add('red-flash');
  setTimeout(() => {
    document.body.classList.remove('red-flash');
  }, 200);
}

// -------------------------------
// Event Listeners
// -------------------------------
startButton.addEventListener("click", startGame);
resetButton.addEventListener('click', resetGame);
