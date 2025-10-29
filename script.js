// -----------------------------
// CLEAN WATER FOR ALL GAME
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  // Elements
  const gameGrid = document.querySelector(".game-grid");
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const milestoneContainer = document.getElementById("milestone-container");
  const popupContainer = document.getElementById("popup-container");
  const startBtn = document.getElementById("start-game");
  const resetBtn = document.getElementById("reset-game");
  const soundWater = document.getElementById("sound-water");
  const soundHappy = document.getElementById("sound-happy");

  let score = 0;
  let timeLeft = 60;
  let moleInterval;
  let timerInterval;
  let hits = 0;
  let gameActive = false;

  function createGrid() {
    gameGrid.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cell.dataset.index = i;
      gameGrid.appendChild(cell);
    }
  }

  function flashScreen(color) {
    // Use flash-white and flash-red classes for the effect
    if (color === "white") {
      document.body.classList.add("flash-white");
      setTimeout(() => {
        document.body.classList.remove("flash-white");
      }, 300);
    } else {
      document.body.classList.add("flash-red");
      setTimeout(() => {
        document.body.classList.remove("flash-red");
      }, 300);
    }
  }

  function puff(hole) {
    // Find the mole or can inside the hole and add puff animation
    const target = hole.querySelector('.mole, .can');
    if (target) {
      target.classList.add('puff');
      setTimeout(() => target.classList.remove('puff'), 350);
    }
  }

  function updateProgress() {
    const percent = Math.min(100, (score / 160) * 100); // 160 points = full bar
    progressBar.style.width = percent + "%";
    if (score >= 160) {
      progressText.textContent = "You have successfully delivered water to the village! 😍😎🤓 Now, join others in helping to deliver life saving water to real people around the world! 💕";
    } else {
      progressText.textContent = `Clean water delivered: ${percent.toFixed(0)}%`;
    }
  }

  function showMilestone(msg) {
  milestoneContainer.textContent = msg;
  milestoneContainer.style.display = "flex";
  setTimeout(() => {
    milestoneContainer.style.display = "none";
    milestoneContainer.textContent = "";
  }, 2000);
}

  function showPopup({win, text}) {
    popupContainer.innerHTML = `
      <div class="popup${win ? " success" : " red"}">
        ${win ? `<img src="img/new_logo.png" class="logo" alt="Charity Water Logo">` : ""}
        <p class="popup-message">${text}</p>
        ${win ? `
          <div class="button-row">
            <a class="btn" href="https://www.charitywater.org/" target="_blank">More Information</a>
            <a class="btn donate" href="https://www.charitywater.org/donate" target="_blank">Donate Now</a>
            <button class="btn play-again" id="play-again-btn" type="button">Play Again</button>
          </div>
        ` : ""}
      </div>
    `;
    popupContainer.style.display = "flex";

    // Add event listener for Play Again button if present
    const playAgainBtn = document.getElementById("play-again-btn");
    if (playAgainBtn) {
      playAgainBtn.addEventListener("click", () => {
        hidePopup();
        resetGame();
      });
    }
  }

  function hidePopup() {
    popupContainer.style.display = "none";
    popupContainer.innerHTML = "";
  }

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = 0;
    timeLeft = 90;
    hits = 0;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    updateProgress();
    milestoneContainer.textContent = "";
    hidePopup();
    createGrid();
    
    spawnMole(); // <-- Add this line to spawn the first mole/can immediately

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame(false);
    }, 1000);

    moleInterval = setInterval(spawnMole, getSpeed());
  }

  function resetGame() {
    gameActive = false;
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    soundWater.pause();
    soundHappy.pause();
    score = 0;
    timeLeft = 60;
    hits = 0;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    updateProgress();
    milestoneContainer.textContent = "";
    hidePopup();
    createGrid();
  }

  function getSpeed() {
    const diff = document.getElementById("difficulty").value;
    if (diff === "easy") return 1500;
    if (diff === "hard") return 800;
    return 1200;
  }

  function spawnMole() {
    if (!gameActive) return;
    const holes = document.querySelectorAll(".grid-cell");
    // Clear all holes before spawning a new mole/can
    holes.forEach(hole => {
      hole.innerHTML = "";
    });

    // Randomly select a hole
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];

    // 20% chance for water can
    if (Math.random() < 0.2) {
      const can = document.createElement("div");
      can.classList.add("can");
      can.addEventListener("click", () => {
        puff(hole);
        flashScreen("red");
        endGame(false, "You hit a Jerry Can! Now, the water will never make it to the village! 😭😭😭 Game Over.");
      });
      hole.appendChild(can);
      return;
    }

    // 50% dirty, 50% clean
    const isDirty = Math.random() < 0.5;
    const mole = document.createElement("div");
    mole.classList.add("mole");
    mole.style.backgroundImage = "url('img/mole.png')";
    mole.dataset.dirty = isDirty;

    // ✅ Create water indicator
    const water = document.createElement("div");
    water.classList.add(isDirty ? "dirty-water" : "clean-water");
    mole.appendChild(water);

    // Mole click logic
    mole.addEventListener("click", () => {
      puff(hole);
      if (isDirty) {
        flashScreen("white");
        score += 10;
        hits++;
        scoreEl.textContent = score;
        updateProgress();
        if (hits === 2) showMilestone("✨Great job! Keep going!");
        if (score >= 160) {
          soundWater.pause();
          soundHappy.currentTime = 0;
          soundHappy.volume = 1;
          soundHappy.play().catch(e => console.log('happyppl.mp3 play error:', e));
          endGame(true, "You have successfully delivered water to the village! 😍😎🤓 Now, help deliver water to real people around the world. 💕");
        }
      } else {
        flashScreen("red");
        score = Math.max(0, score - 5); // Deduct 5 points, but don't go below 0
        scoreEl.textContent = score;
        updateProgress();
        showMilestone("👀Oops! That was clean water!");
      }
    });

    hole.appendChild(mole);
  }

  function endGame(win, msg) {
    gameActive = false;
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    if (win) {
      showPopup({
        win: true,
        text: msg || "You have successfully delivered water to the village!"
      });
    } else {
      soundWater.pause(); // Stop water sound on game over
      showPopup({
        win: false,
        text: msg || "Game Over!"
      });
      // Automatically close the popup after 5 seconds
      setTimeout(hidePopup, 5000);
    }
  }

  // Populate grid on page load
  createGrid();

  // Event listeners
  startBtn.addEventListener("click", () => {
    soundWater.currentTime = 0;
    soundWater.loop = true;
    soundWater.volume = 1;
    soundWater.playbackRate = 1; // Normal speed
    soundWater.play().catch(e => console.log('water.mp3 play error:', e));
    startGame();
  });
  resetBtn.addEventListener("click", resetGame);

  // -----------------------------
  // FLASH EFFECTS
  // -----------------------------
  function triggerWhiteFlash() {
    document.body.classList.add("white-flash");
    setTimeout(() => document.body.classList.remove("white-flash"), 200);
  }

  function triggerRedFlash() {
    document.body.classList.add("red-flash");
    setTimeout(() => document.body.classList.remove("red-flash"), 200);
  }

  // Fact rendering
  const facts = [
    "771 million people lack access to clean water.",
    "Every 2 minutes a child dies from a water-related disease.",
    "Women and girls spend 200 million hours daily collecting water.",
    "Access to clean water improves health and education.",
    "Charity: Water helps bring clean water to communities worldwide."
  ];

  let factIndex = 0;
  const factEl = document.getElementById("water-fact");

  function showNextFact() {
    factEl.textContent = facts[factIndex];
    factIndex = (factIndex + 1) % facts.length;
  }
  setInterval(showNextFact, 4000);
  showNextFact();
});


