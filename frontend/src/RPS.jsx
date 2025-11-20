import React, { useState } from "react";
import "./GameStyles.scss"; // shared styling for all games

const RPS = () => {
  const choices = ["Rock", "Paper", "Scissors"];
  const [result, setResult] = useState("");
  const [aiChoice, setAiChoice] = useState("");
  const [userChoice, setUserChoice] = useState("");

  const play = (choice) => {
    const ai = choices[Math.floor(Math.random() * 3)];
    setUserChoice(choice);
    setAiChoice(ai);

    if (choice === ai) {
      setResult("It's a Tie!");
    } else if (
      (choice === "Rock" && ai === "Scissors") ||
      (choice === "Paper" && ai === "Rock") ||
      (choice === "Scissors" && ai === "Paper")
    ) {
      setResult("You Win!");
    } else {
      setResult("You Lose!");
    }
  };

  return (
    <div className="game-wrapper">
      <h2>Rock • Paper • Scissors</h2>

      <div className="rps-buttons">
        {choices.map((c) => (
          <button key={c} onClick={() => play(c)}>{c}</button>
        ))}
      </div>

      <div className="game-results">
        {userChoice && <p><strong>You:</strong> {userChoice}</p>}
        {aiChoice && <p><strong>AI:</strong> {aiChoice}</p>}
        {result && <h3>{result}</h3>}
      </div>
    </div>
  );
};

export default RPS;
