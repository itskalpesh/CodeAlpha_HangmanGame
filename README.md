# CodeAlpha Hangman Game 🎮

A modern, dual-mode (Console CLI & Interactive Web UI) **Hangman Game** developed in Python and HTML5/CSS3/JavaScript for the **CodeAlpha Python Programming Internship (Task 1)**.

---

## 📌 Project Overview

- **Goal:** Create a simple text-based and visual Hangman game where the player guesses a secret word one letter at a time.
- **Rules:**
  - The secret word is randomly selected from a curated list of words with clues and categories.
  - Maximum of **6 incorrect guesses** before game over.
  - Interactive ASCII gallows progression in CLI and dynamic animated SVG visualizer in Web UI.
- **Technologies Used:**
  - **Python 3:** Core game engine, `random`, `http.server`, `json`, `sys`.
  - **HTML5 & CSS3:** Modern dark glassmorphic design system, responsive flexbox/grid, custom animations.
  - **Vanilla JavaScript:** Event handlers, state management, REST API fetch, and Web Audio API synthesized sound FX (zero external dependencies).

---

## ✨ Features

- 🎯 **Categorized Word Bank:** Predefined programming, tech, and engineering vocabulary with context clues.
- 🧮 **6 Lives System:** Visual hearts indicator and real-time danger meter tracking remaining attempts.
- 🎨 **Animated SVG Gallows:** Dynamic body part drawing as incorrect guesses accumulate.
- ⌨️ **Dual Input:** Full on-screen virtual keyboard with color feedback (correct/wrong) + physical keyboard listener.
- 🔊 **Synthesized Web Audio SFX:** Real-time audio tones for key clicks, correct letters, mistakes, victory fanfares, and game over sounds (no external audio files needed).
- 🔥 **Win Streak Counter:** Tracks consecutive victories.
- 🌐 **Dual-Running Modes:**
  - Run as a standalone Python CLI in terminal: `python hangman.py`
  - Run with local Python Web API server: `python app.py` (visit `http://localhost:5001`)
  - Run purely in the browser by opening `index.html`.

---

## 📂 Project Structure

```
CodeAlpha_HangmanGame/
├── hangman.py       # Standalone Python CLI game
├── app.py           # Python HTTP server & REST API
├── index.html       # Modern HTML5 Web UI structure
├── style.css        # Glassmorphic dark theme & animations
├── app.js           # Client logic, SVG rendering, Web Audio SFX
└── README.md        # Comprehensive documentation
```

---

## 🚀 How to Run

### Option 1: Python CLI Mode (Console)
```bash
cd CodeAlpha_HangmanGame
python hangman.py
```

### Option 2: Python Web Application (Recommended)
```bash
cd CodeAlpha_HangmanGame
python app.py
```
Open your browser and navigate to: **`http://localhost:5001`**

### Option 3: Direct Browser Launch
Simply double-click `index.html` in your file explorer or open it in any modern web browser.

---

## 🧠 Key Python Concepts Implemented
- **Random Word Selection:** Utilizing `random.choice()`.
- **Game Loop:** `while` loop handling round states and attempt limits.
- **Conditional Logic:** `if-elif-else` branches for validating alphabetic characters and duplicate guesses.
- **Collections & Strings:** `set` for unique guesses, list slicing, and string transformations.
- **HTTP Server & REST Endpoints:** Using Python's built-in `http.server` to serve JSON API and static files.

---

## 👨‍💻 Developer Profile
- **Author:** Kalpesh Kurbetti
- **Role:** Python Programming & Software Development Intern
- **Organization:** CodeAlpha
- **GitHub:** [github.com/itskalpesh](https://github.com/itskalpesh)
- **Contact:** +91 9743285441

---

## 📜 License & Acknowledgements
Developed as part of the **CodeAlpha Python Programming Internship**.
