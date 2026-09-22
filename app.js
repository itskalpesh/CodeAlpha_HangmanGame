/**
 * CodeAlpha Hangman Master - Interactive Application Logic
 * Author: Kalpesh Kurbetti (github.com/itskalpesh)
 * Supports both Live Python REST API (`python app.py`) & Standalone Client Engine
 */

const FALLBACK_WORDS = [
    { word: "PYTHON", category: "Programming", hint: "High-level syntax, snake logo" },
    { word: "DEVELOPER", category: "Careers", hint: "Architect and builder of software" },
    { word: "ALGORITHM", category: "Computer Science", hint: "Step-by-step logic for problem solving" },
    { word: "CODEALPHA", category: "Tech & Internship", hint: "The organization empowering developers" },
    { word: "JAVASCRIPT", category: "Web Tech", hint: "The scripting language of the web" },
    { word: "RESPONSIVE", category: "UI/UX Design", hint: "Adapts smoothly to mobile and desktop" },
    { word: "VARIABLE", category: "Programming", hint: "Holds dynamic data in memory" },
    { word: "DATABASE", category: "Data & Backend", hint: "Structured storage system for records" }
];

const BODY_PARTS = [
    "part-head",
    "part-body",
    "part-arm-left",
    "part-arm-right",
    "part-leg-left",
    "part-leg-right"
];

const MAX_ATTEMPTS = 6;

// Application State
const state = {
    gameId: null,
    secretWord: "",
    hint: "",
    category: "",
    guessedLetters: new Set(),
    incorrectCount: 0,
    status: "playing", // 'playing', 'won', 'lost'
    streak: 0,
    soundEnabled: true,
    isApiMode: false
};

// Web Audio Sound Synthesizer (Zero external file dependencies)
class SoundFX {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playTone(freq, type, duration, delay = 0) {
        if (!state.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        setTimeout(() => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                // Audio context handling
            }
        }, delay);
    }

    keyPress() {
        this.playTone(400, 'sine', 0.05);
    }

    correct() {
        this.playTone(587.33, 'sine', 0.12, 0); // D5
        this.playTone(880, 'sine', 0.2, 100);   // A5
    }

    wrong() {
        this.playTone(220, 'sawtooth', 0.18, 0); // A3
        this.playTone(164.81, 'sawtooth', 0.25, 120); // E3
    }

    win() {
        this.playTone(523.25, 'triangle', 0.15, 0);   // C5
        this.playTone(659.25, 'triangle', 0.15, 120); // E5
        this.playTone(783.99, 'triangle', 0.18, 240); // G5
        this.playTone(1046.50, 'triangle', 0.4, 380); // C6
    }

    lose() {
        this.playTone(329.63, 'sawtooth', 0.25, 0);   // E4
        this.playTone(293.66, 'sawtooth', 0.25, 200); // D4
        this.playTone(261.63, 'sawtooth', 0.4, 400);  // C4
    }
}

const sfx = new SoundFX();

// DOM Elements
const categoryDisplay = document.getElementById("category-display");
const livesContainer = document.getElementById("lives-container");
const streakDisplay = document.getElementById("streak-display");
const dangerBar = document.getElementById("danger-bar");
const hintDisplay = document.getElementById("hint-display");
const wordContainer = document.getElementById("word-container");
const keyboardGrid = document.getElementById("keyboard-grid");
const newGameBtn = document.getElementById("new-game-btn");
const revealHintBtn = document.getElementById("reveal-hint-btn");
const soundBtn = document.getElementById("sound-btn");

// Modal Elements
const resultModal = document.getElementById("result-modal");
const modalBadge = document.getElementById("modal-badge");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalSecretWord = document.getElementById("modal-secret-word");
const modalPlayAgainBtn = document.getElementById("modal-play-again-btn");

// Initialize Virtual Keyboard (A to Z)
function initKeyboard() {
    keyboardGrid.innerHTML = "";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    letters.forEach(letter => {
        const btn = document.createElement("button");
        btn.className = "key-btn";
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.id = `key-${letter}`;
        btn.addEventListener("click", () => handleLetterGuess(letter));
        keyboardGrid.appendChild(btn);
    });
}

// Render Heart Lives
function renderLives() {
    livesContainer.innerHTML = "";
    const remaining = MAX_ATTEMPTS - state.incorrectCount;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const heart = document.createElement("span");
        heart.className = `heart-icon ${i >= remaining ? "lost" : ""}`;
        heart.textContent = "❤️";
        livesContainer.appendChild(heart);
    }
}

// Render SVG Hangman Parts
function updateHangmanVisuals() {
    BODY_PARTS.forEach((partId, idx) => {
        const el = document.getElementById(partId);
        if (el) {
            if (idx < state.incorrectCount) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    });

    const percent = (state.incorrectCount / MAX_ATTEMPTS) * 100;
    dangerBar.style.width = `${percent}%`;
}

// Render Word Tiles
function renderWordTiles() {
    wordContainer.innerHTML = "";
    const wordArr = state.secretWord.split("");
    wordArr.forEach(letter => {
        const tile = document.createElement("div");
        tile.className = "letter-tile";
        if (state.guessedLetters.has(letter)) {
            tile.textContent = letter;
            tile.classList.add("revealed");
        } else if (state.status === "lost") {
            tile.textContent = letter;
            tile.style.color = "var(--accent-rose)";
        } else {
            tile.textContent = "";
        }
        wordContainer.appendChild(tile);
    });
}

// Start a New Game (Tries Python API, falls back to Client Mode)
async function startNewGame() {
    try {
        const res = await fetch("/api/new-game");
        if (res.ok) {
            const data = await res.json();
            state.isApiMode = true;
            state.gameId = data.game_id;
            state.secretWord = ""; // Hidden from client in pure API mode until won/lost
            state.hint = data.hint;
            state.category = data.category;
            state.incorrectCount = 0;
            state.guessedLetters = new Set();
            state.status = "playing";
            state.wordLength = data.word_length;
            
            // Build placeholders
            state.maskedList = data.masked_word;
            renderApiState(data);
            return;
        }
    } catch (e) {
        // Fallback to client engine
        state.isApiMode = false;
    }

    // Client-side fallback engine
    const randomItem = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    state.secretWord = randomItem.word;
    state.hint = randomItem.hint;
    state.category = randomItem.category;
    state.guessedLetters = new Set();
    state.incorrectCount = 0;
    state.status = "playing";

    categoryDisplay.textContent = state.category;
    hintDisplay.textContent = state.hint;
    streakDisplay.textContent = `🔥 ${state.streak}`;

    renderLives();
    updateHangmanVisuals();
    renderWordTiles();
    initKeyboard();
    resultModal.classList.remove("active");
}

function renderApiState(data) {
    categoryDisplay.textContent = data.category;
    hintDisplay.textContent = data.hint;
    streakDisplay.textContent = `🔥 ${state.streak}`;
    state.incorrectCount = data.incorrect_count;

    renderLives();
    updateHangmanVisuals();

    // Render tiles from masked word
    wordContainer.innerHTML = "";
    data.masked_word.forEach(char => {
        const tile = document.createElement("div");
        tile.className = "letter-tile";
        if (char !== "_") {
            tile.textContent = char;
            tile.classList.add("revealed");
        } else {
            tile.textContent = "";
        }
        wordContainer.appendChild(tile);
    });

    initKeyboard();
    resultModal.classList.remove("active");
}

// Handle Guess Action
async function handleLetterGuess(letter) {
    if (state.status !== "playing") return;
    if (state.guessedLetters.has(letter)) return;

    state.guessedLetters.add(letter);
    const keyEl = document.getElementById(`key-${letter}`);
    if (keyEl) keyEl.disabled = true;

    if (state.isApiMode && state.gameId) {
        try {
            const res = await fetch("/api/guess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_id: state.gameId, letter: letter })
            });
            if (res.ok) {
                const data = await res.json();
                state.incorrectCount = data.incorrect_count;
                state.status = data.status;

                if (data.is_correct) {
                    sfx.correct();
                    if (keyEl) keyEl.classList.add("correct");
                } else {
                    sfx.wrong();
                    if (keyEl) keyEl.classList.add("wrong");
                }

                renderLives();
                updateHangmanVisuals();

                // Update tiles
                wordContainer.innerHTML = "";
                data.masked_word.forEach(char => {
                    const tile = document.createElement("div");
                    tile.className = "letter-tile";
                    if (char !== "_") {
                        tile.textContent = char;
                        tile.classList.add("revealed");
                    }
                    wordContainer.appendChild(tile);
                });

                if (data.status === "won") {
                    handleVictory(data.revealed_word || "CORRECT");
                } else if (data.status === "lost") {
                    handleDefeat(data.revealed_word || "UNKNOWN");
                }
                return;
            }
        } catch (e) {
            console.warn("API guess failed, operating in fallback mode", e);
        }
    }

    // Standalone Client Logic
    if (state.secretWord.includes(letter)) {
        sfx.correct();
        if (keyEl) keyEl.classList.add("correct");
    } else {
        sfx.wrong();
        if (keyEl) keyEl.classList.add("wrong");
        state.incorrectCount++;
    }

    renderLives();
    updateHangmanVisuals();
    renderWordTiles();

    // Check Win/Loss conditions
    const isWon = state.secretWord.split("").every(l => state.guessedLetters.has(l));
    const isLost = state.incorrectCount >= MAX_ATTEMPTS;

    if (isWon) {
        handleVictory(state.secretWord);
    } else if (isLost) {
        handleDefeat(state.secretWord);
    }
}

function handleVictory(word) {
    state.status = "won";
    state.streak++;
    streakDisplay.textContent = `🔥 ${state.streak}`;
    sfx.win();

    modalBadge.textContent = "VICTORY";
    modalBadge.className = "modal-badge victory";
    modalIcon.textContent = "🏆";
    modalTitle.textContent = "Brilliant Guessing!";
    modalDesc.textContent = `You uncovered the word with only ${state.incorrectCount} mistake(s). Current streak: ${state.streak}`;
    modalSecretWord.textContent = word;

    setTimeout(() => {
        resultModal.classList.add("active");
    }, 450);
}

function handleDefeat(word) {
    state.status = "lost";
    state.streak = 0;
    streakDisplay.textContent = `🔥 0`;
    sfx.lose();

    modalBadge.textContent = "GAME OVER";
    modalBadge.className = "modal-badge defeat";
    modalIcon.textContent = "💀";
    modalTitle.textContent = "Out of Lives!";
    modalDesc.textContent = "The gallows claimed this round. Practice makes perfect!";
    modalSecretWord.textContent = word;

    setTimeout(() => {
        resultModal.classList.add("active");
    }, 450);
}

// Physical Keyboard Listener
window.addEventListener("keydown", (e) => {
    if (resultModal.classList.contains("active")) {
        if (e.key === "Enter" || e.key === " ") {
            startNewGame();
        }
        return;
    }

    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleLetterGuess(key);
    }
});

// Event Listeners
newGameBtn.addEventListener("click", () => {
    sfx.keyPress();
    startNewGame();
});

modalPlayAgainBtn.addEventListener("click", () => {
    sfx.keyPress();
    startNewGame();
});

revealHintBtn.addEventListener("click", () => {
    sfx.keyPress();
    hintDisplay.style.animation = "pulse 0.6s ease";
    setTimeout(() => { hintDisplay.style.animation = ""; }, 600);
});

soundBtn.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    soundBtn.textContent = state.soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
    soundBtn.style.color = state.soundEnabled ? "var(--accent-emerald)" : "var(--text-muted)";
});

// Start Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
    startNewGame();
});
