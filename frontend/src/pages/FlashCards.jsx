import React, { useState } from "react";
import "./GameStyles.scss";

const cards = [
  { q: "What is the capital of France?", a: "Paris" },
  { q: "2 + 2 =", a: "4" },
  { q: "React is a ___ library?", a: "JavaScript" },
  { q: "HTML stands for?", a: "HyperText Markup Language" },
];

const FlashCards = () => {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextCard = () => {
    setShowAnswer(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="game-wrapper">
      <h2>Flash Cards</h2>

      <div className="flash-card">
        <p className="question">
          {showAnswer ? cards[index].a : cards[index].q}
        </p>

        <button onClick={() => setShowAnswer(!showAnswer)}>
          {showAnswer ? "Show Question" : "Show Answer"}
        </button>

        <button onClick={nextCard} className="next-btn">
          Next Card →
        </button>
      </div>
    </div>
  );
};

export default FlashCards;
