import React, { useState } from "react";
import "./GameStyles.scss";

const GuessNumber = () => {
  const [target] = useState(Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");

  const handleGuess = (e) => {
    e.preventDefault();
    const num = Number(guess);

    if (!num) {
      setMessage("Enter a valid number between 1–10");
      return;
    }

    if (num === target) setMessage("🎉 Correct! You guessed the number!");
    else if (num > target) setMessage("Too high! Try again.");
    else setMessage("Too low! Try again.");

    setGuess("");
  };

  return (
    <div className="game-wrapper">
      <h2>Guess the Number</h2>
      <p>I'm thinking of a number from 1–10...</p>

      <form onSubmit={handleGuess}>
        <input
          type="number"
          value={guess}
          placeholder="Enter your guess"
          onChange={(e) => setGuess(e.target.value)}
        />
        <button type="submit">Guess</button>
      </form>

      <p className="game-message">{message}</p>
    </div>
  );
};

export default GuessNumber;
