"""
CodeAlpha Task 1: Hangman Game Web Server & API
Author: Kalpesh Kurbetti
GitHub: https://github.com/itskalpesh
Description: Lightweight Python HTTP server providing REST API endpoints for Hangman
             and serving the HTML5/CSS3/JS Web Application.
"""

import http.server
import json
import os
import random
import sys
import urllib.parse

PORT = 5001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

WORDS_DATA = [
    {"word": "PYTHON", "category": "Programming", "hint": "High-level syntax, snake logo"},
    {"word": "DEVELOPER", "category": "Careers", "hint": "Architect and builder of software"},
    {"word": "ALGORITHM", "category": "Computer Science", "hint": "Step-by-step logic for problem solving"},
    {"word": "CODEALPHA", "category": "Tech & Internship", "hint": "The organization empowering developers"},
    {"word": "JAVASCRIPT", "category": "Web Tech", "hint": "The scripting language of the web"},
    {"word": "RESPONSIVE", "category": "UI/UX Design", "hint": "Adapts smoothly to mobile and desktop"},
    {"word": "VARIABLE", "category": "Programming", "hint": "Holds dynamic data in memory"},
    {"word": "DATABASE", "category": "Data & Backend", "hint": "Structured storage system for records"}
]

# In-memory game sessions store
active_games = {}


class HangmanRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/new-game":
            category_query = urllib.parse.parse_qs(parsed.query).get("category", [None])[0]
            
            if category_query:
                filtered = [w for w in WORDS_DATA if w["category"].lower() == category_query.lower()]
                selected = random.choice(filtered) if filtered else random.choice(WORDS_DATA)
            else:
                selected = random.choice(WORDS_DATA)

            game_id = str(random.randint(100000, 999999))
            active_games[game_id] = {
                "word": selected["word"],
                "hint": selected["hint"],
                "category": selected["category"],
                "guessed": [],
                "incorrect_count": 0,
                "max_attempts": 6,
                "status": "playing"
            }

            masked = ["_" for _ in selected["word"]]
            self._send_json({
                "game_id": game_id,
                "masked_word": masked,
                "hint": selected["hint"],
                "category": selected["category"],
                "word_length": len(selected["word"]),
                "incorrect_count": 0,
                "max_attempts": 6,
                "guessed": [],
                "status": "playing"
            })
        elif parsed.path == "/api/categories":
            cats = sorted(list(set(w["category"] for w in WORDS_DATA)))
            self._send_json({"categories": cats})
        else:
            # Fall back to serving static files (index.html, style.css, app.js)
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/guess":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                payload = json.loads(body)
                game_id = str(payload.get("game_id"))
                letter = str(payload.get("letter", "")).strip().upper()
            except Exception:
                self._send_json({"error": "Invalid request body"}, 400)
                return

            if game_id not in active_games:
                self._send_json({"error": "Game session not found or expired"}, 404)
                return

            game = active_games[game_id]

            if game["status"] != "playing":
                self._send_json({
                    "error": f"Game is already over ({game['status']})",
                    "status": game["status"]
                }, 400)
                return

            if len(letter) != 1 or not letter.isalpha():
                self._send_json({"error": "Must submit a single alphabetic letter"}, 400)
                return

            if letter in game["guessed"]:
                self._send_json({"error": f"Letter '{letter}' already guessed", "already_guessed": True}, 400)
                return

            game["guessed"].append(letter)
            secret = game["word"]

            if letter not in secret:
                game["incorrect_count"] += 1

            # Check win / lose
            won = all(l in game["guessed"] for l in secret)
            lost = game["incorrect_count"] >= game["max_attempts"]

            if won:
                game["status"] = "won"
            elif lost:
                game["status"] = "lost"

            masked = [l if l in game["guessed"] else "_" for l in secret]

            response_data = {
                "game_id": game_id,
                "letter": letter,
                "is_correct": letter in secret,
                "masked_word": masked,
                "incorrect_count": game["incorrect_count"],
                "max_attempts": game["max_attempts"],
                "guessed": game["guessed"],
                "status": game["status"],
                "hint": game["hint"],
                "category": game["category"]
            }

            if won or lost:
                response_data["revealed_word"] = secret

            self._send_json(response_data)
        else:
            self._send_json({"error": "Not Found"}, 404)


def run_server():
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, HangmanRequestHandler)
    print("=" * 60)
    print(f"🚀 CodeAlpha Hangman Web Server running at: http://localhost:{PORT}")
    print(f"📁 Serving files from: {DIRECTORY}")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
        sys.exit(0)


if __name__ == "__main__":
    run_server()
