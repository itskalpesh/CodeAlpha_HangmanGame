"""
CodeAlpha Task 1: Hangman Game (Console Edition)
Author: Kalpesh Kurbetti
GitHub: https://github.com/itskalpesh
Description: A classic text-based Hangman game where the player guesses a secret word
             letter-by-letter with a maximum of 6 incorrect attempts allowed.
"""

import random
import sys

# Predefined list of words with corresponding hints
WORD_BANK = [
    {"word": "PYTHON", "hint": "A popular high-level programming language known for simplicity"},
    {"word": "DEVELOPER", "hint": "A person who writes and builds software applications"},
    {"word": "ALGORITHM", "hint": "A step-by-step procedure or formula for solving a problem"},
    {"word": "CODEALPHA", "hint": "The tech organization hosting this programming internship"},
    {"word": "VARIABLE", "hint": "A named storage location in memory that holds a value"},
    {"word": "DATABASE", "hint": "An organized collection of structured data or information"},
    {"word": "FUNCTION", "hint": "A reusable block of code that performs a specific action"},
    {"word": "COMPUTER", "hint": "An electronic device for storing and processing data"}
]

# ASCII art stages representing the hangman progression (0 to 6 incorrect guesses)
HANGMAN_STAGES = [
    """
       +---+
       |   |
           |
           |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
           |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
       |   |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|   |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
      /    |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
      / \\  |
           |
    =========
    """
]

MAX_INCORRECT_GUESSES = 6


def display_game_state(secret_word, guessed_letters, incorrect_count, hint):
    """Prints the current visual hangman state, word blanks, and guessed letters."""
    print("\n" + "=" * 50)
    print(HANGMAN_STAGES[incorrect_count])
    print(f"Hint: {hint}")
    
    # Display the word with guessed letters revealed and others as '_'
    displayed_word = [letter if letter in guessed_letters else "_" for letter in secret_word]
    print("\nWord: " + " ".join(displayed_word))
    
    remaining_attempts = MAX_INCORRECT_GUESSES - incorrect_count
    print(f"\nRemaining Attempts: {remaining_attempts}/{MAX_INCORRECT_GUESSES}")
    
    guessed_sorted = sorted(list(guessed_letters))
    print(f"Guessed Letters: {', '.join(guessed_sorted) if guessed_sorted else 'None'}")
    print("=" * 50)


def play_hangman():
    """Runs a single round of the Hangman game."""
    selected_entry = random.choice(WORD_BANK)
    secret_word = selected_entry["word"]
    hint = selected_entry["hint"]
    
    guessed_letters = set()
    incorrect_count = 0
    
    print("\n" + "*" * 50)
    print("     WELCOME TO CODEALPHA HANGMAN GAME!     ")
    print("*" * 50)
    print(f"Can you guess the secret word before running out of {MAX_INCORRECT_GUESSES} lives?")

    while incorrect_count < MAX_INCORRECT_GUESSES:
        display_game_state(secret_word, guessed_letters, incorrect_count, hint)
        
        # Check if the player has guessed all letters
        if all(letter in guessed_letters for letter in secret_word):
            print("\n🎉 CONGRATULATIONS! YOU WON! 🎉")
            print(f"You successfully guessed the word: {secret_word}")
            return True

        guess = input("\nEnter a letter (or type 'quit' to exit): ").strip().upper()
        
        if guess == "QUIT":
            print("\nGame exited. Thank you for playing!")
            return False

        # Input validation
        if len(guess) != 1 or not guess.isalpha():
            print("\n[!] Invalid input: Please enter a single alphabetic letter (A-Z).")
            continue
            
        if guess in guessed_letters:
            print(f"\n[!] You already guessed '{guess}'. Try a different letter!")
            continue

        guessed_letters.add(guess)

        if guess in secret_word:
            print(f"\n[✓] Good job! '{guess}' is in the secret word!")
        else:
            incorrect_count += 1
            print(f"\n[✗] Oops! '{guess}' is NOT in the secret word.")

    # Player ran out of attempts
    display_game_state(secret_word, guessed_letters, incorrect_count, hint)
    print("\n💀 GAME OVER! YOU RAN OUT OF LIVES! 💀")
    print(f"The secret word was: {secret_word}")
    return False


def main():
    """Main game loop supporting replay."""
    while True:
        play_hangman()
        replay = input("\nWould you like to play again? (Y/N): ").strip().upper()
        if replay != "Y":
            print("\nThanks for playing CodeAlpha Hangman! Goodbye!\n")
            break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSession terminated by user. Goodbye!")
        sys.exit(0)
