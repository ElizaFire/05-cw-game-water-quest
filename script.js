/* ===============================
   Clean Water For All - Game Logic
   =============================== */

// Game state variables
let score = 0;
let timeLeft = 30;
let gameActive = false;
let spawnInterval, countdownInterval;

// Game configuration
const MOLE_POPUP_TIME = 1000; // milliseconds (how long mole stays up)
const MOLE_SPAWN_RATE = 900;  // how often new mole appears

// Select DOM elements
const grid = document.querySelector(".game-grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start-game");

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

  // Create mole wrapper and mole element
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
// Start or Restart Game
// -------------------------------
function startGame() {
  if (gameActive) return;

  // Reset values
  score = 0;
  timeLeft = 30;
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
}

// -------------------------------
// End Game
// -------------------------------
function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(countdownInterval);

  // Clear any remaining moles
  document.querySelectorAll(".grid-cell").forEach(cell => (cell.innerHTML = ""));

  // Display game-over message
  const gameOver = document.createElement("div");
  gameOver.classList.add("game-over");
  gameOver.textContent = `Game Over! Final Score: ${score}`;
  grid.insertAdjacentElement("afterend", gameOver);
}

// -------------------------------
// Event Listeners
// -------------------------------
startButton.addEventListener("click", startGame);
