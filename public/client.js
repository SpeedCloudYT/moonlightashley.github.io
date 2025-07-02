// Firebase Realtime Database reference
const db = firebase.database();
const roomRef = db.ref("rooms/default");

// Generate a unique player ID
const playerId = 'p' + Math.random().toString(36).slice(2, 10);
let myName = "Mystic";

// Game state
let cards = [];
let flipped = [];
let matched = [];

// Join the game
function joinGame() {
  const inputName = document.getElementById("name").value.trim();
  if (!inputName) {
    alert("Please enter a username!");
    return;
  }

  myName = inputName.slice(0, 16);
  document.getElementById("status").textContent = `Joined as ${myName}`;

  // Register player
  roomRef.child("players").child(playerId).set({ name: myName });

  // Show player list
  roomRef.child("players").on("value", snap => {
    const players = Object.values(snap.val() || {});
    const lobby = document.getElementById("lobby");
    lobby.innerHTML = "<b>Players:</b><br>" + players.map(p => `👤 ${p.name}`).join("<br>");
  });

  // Create cards if not present
  roomRef.child("cards").once("value", snap => {
    if (!snap.exists()) {
      const symbols = ['🌙','🔥','🌿','💧','💀','⚡','🌟','🧿'];
      const shuffled = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
      roomRef.child("cards").set(shuffled);
    }
  });

  // Sync cards
  roomRef.child("cards").on("value", snap => {
    cards = snap.val() || [];
    renderBoard();
  });

  // Sync matches
  roomRef.child("matches").on("child_added", snap => {
    const match = snap.val();
    matched.push(...match.pair);
    renderBoard();
  });

  // Sync chat
  roomRef.child("chat").on("child_added", snap => {
    const msg = snap.val();
    const log = document.getElementById("chatLog");
    log.innerHTML += `<div><b>${msg.name}</b>: ${msg.text}</div>`;
    log.scrollTop = log.scrollHeight;
  });
}

// Render the game board
function renderBoard() {
  const board = document.getElementById("game");
  board.innerHTML = "";
  cards.forEach((symbol, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;

    if (matched