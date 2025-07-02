const symbols = ['??','??','??','??','??','?','??','??'];
let cards = [];
let flipped = [];
let matched = [];
let score = 0;
let lives = 3;
let timeLeft = 60;
let countdown;
let currentLevel = 1;

const game = document.getElementById("game");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const message = document.getElementById("message");

function startGame(level = 1) {
  message.textContent = "";
  flipped = [];
  matched = [];
  timeLeft = 60;
  updateHUD();

  const pairs = Math.min(symbols.length, level + 3);
  const selected = symbols.slice(0, pairs);
  cards = [...selected, ...selected].sort(() => Math.random() - 0.5);

  game.innerHTML = "";
  game.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cards.length))}, 80px)`;

  cards.forEach((symbol, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.dataset.symbol = symbol;
    card.onclick = () => flipCard(card, i);
    game.appendChild(card);
  });

  clearInterval(countdown);
  countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      lives--;
      updateHUD();
      if (lives <= 0) {
        endGame("? Time's up and you're out of lives!");
      } else {
        message.textContent = "? Time's up! Try again...";
        setTimeout(() => startGame(currentLevel), 1500);
      }
    }
  }, 1000);
}

function flipCard(card, index) {
  if (flipped.includes(index) || matched.includes(index)) return;
  card.textContent = card.dataset.symbol;
  flipped.push(index);

  if (flipped.length === 2) {
    const [a, b] = flipped;
    const cardA = document.querySelectorAll(".card")[a];
    const cardB = document.querySelectorAll(".card")[b];

    if (cardA.dataset.symbol === cardB.dataset.symbol) {
      matched.push(a, b);
      cardA.classList.add("matched");
      cardB.classList.add("matched");
      score += 10;
      updateHUD();
      if (matched.length === cards.length) {
        clearInterval(countdown);
        message.textContent = "?? Level Complete!";
        currentLevel++;
        setTimeout(() => startGame(currentLevel), 1500);
      }
    } else {
      lives--;
      updateHUD();
      setTimeout(() => {
        cardA.textContent = "?";
        cardB.textContent = "?";
        if (lives <= 0) {
          endGame("?? No lives left!");
        }
      }, 800);
    }
    flipped = [];
  }
}

function updateHUD() {
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  timerDisplay.textContent = timeLeft;
}

function endGame(msg) {
  message.textContent = msg;
  game.innerHTML = "";
  clearInterval(countdown);
  currentLevel = 1;
  score = 0;
  lives = 3;
  setTimeout(() => startGame(), 2000);
}

startGame();
