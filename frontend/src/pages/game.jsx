import React, { useState, useEffect } from 'react';
import { Brain, Check, X, Lightbulb, Trophy, Clock } from 'lucide-react';

const PUZZLE_TYPES = {
  SEQUENCE: 'sequence',
  PATTERN: 'pattern',
  LOGIC: 'logic',
  DEDUCTION: 'deduction'
};

const PUZZLES = {
  sequence: [
    {
      question: "What comes next in the sequence: 2, 4, 8, 16, ?",
      options: ["24", "30", "32", "64"],
      correct: 2,
      explanation: "Each number is doubled (×2). 16 × 2 = 32"
    },
    {
      question: "Complete the sequence: 1, 1, 2, 3, 5, 8, ?",
      options: ["11", "13", "15", "16"],
      correct: 1,
      explanation: "Fibonacci sequence: each number is the sum of the previous two (5 + 8 = 13)"
    },
    {
      question: "Find the next: 100, 81, 64, 49, ?",
      options: ["36", "40", "30", "25"],
      correct: 0,
      explanation: "Perfect squares in reverse: 10², 9², 8², 7², 6² = 36"
    }
  ],
  pattern: [
    {
      question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?",
      options: ["True", "False", "Cannot be determined"],
      correct: 0,
      explanation: "This follows transitive property: if A→B and B→C, then A→C"
    },
    {
      question: "If RED = 27, BLUE = 40, what does GREEN equal?",
      options: ["45", "49", "50", "47"],
      correct: 1,
      explanation: "Sum of letter positions: G(7)+R(18)+E(5)+E(5)+N(14) = 49"
    },
    {
      question: "MONDAY is to FRIDAY as JANUARY is to ?",
      options: ["DECEMBER", "MAY", "JUNE", "MARCH"],
      correct: 1,
      explanation: "Monday is 5th day of week, Friday is 5th. January is 1st month, May is 5th month."
    }
  ],
  logic: [
    {
      question: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?",
      options: ["$0.10", "$0.05", "$0.15", "$0.20"],
      correct: 1,
      explanation: "Ball = $0.05, Bat = $1.05. The bat costs $1 more and total is $1.10"
    },
    {
      question: "You have a 3L jug and a 5L jug. How can you measure exactly 4L?",
      options: ["Fill 5L, pour into 3L, pour out 3L, pour remaining into 3L, fill 5L again, top off 3L", "Fill both and pour out 3L", "Fill 3L twice minus 5L", "Impossible"],
      correct: 0,
      explanation: "After steps: 5L has 2L left, pour to 3L (now has 2L). Fill 5L again, top off 3L (needs 1L), leaving 4L in 5L jug"
    },
    {
      question: "Three light switches outside a room control three bulbs inside. You can flip switches but only enter the room once. How do you determine which switch controls which bulb?",
      options: ["Turn on switch 1 for 5 min, off, turn on 2, enter", "Turn all on and off quickly", "Turn on 1 and 2", "Cannot be done"],
      correct: 0,
      explanation: "Switch 1 (hot+off) = warm bulb, Switch 2 (on) = lit bulb, Switch 3 = cold+off bulb"
    }
  ],
  deduction: [
    {
      question: "Alice is taller than Bob. Charlie is shorter than Bob. Who is the tallest?",
      options: ["Alice", "Bob", "Charlie", "Cannot determine"],
      correct: 0,
      explanation: "Alice > Bob > Charlie, so Alice is tallest"
    },
    {
      question: "If some apples are fruits and all fruits are healthy, which must be true?",
      options: ["All apples are healthy", "Some healthy things are apples", "All healthy things are apples", "Some apples are healthy"],
      correct: 3,
      explanation: "Some apples → fruits → healthy, so at least some apples must be healthy"
    },
    {
      question: "A farmer has 17 sheep. All but 9 die. How many are left?",
      options: ["8", "9", "0", "17"],
      correct: 1,
      explanation: "'All but 9' means 9 remain alive. It's a language trick!"
    }
  ]
};

export default function LogicMaster() {
  const [gameMode, setGameMode] = useState('menu');
  const [selectedType, setSelectedType] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (gameMode === 'playing' && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameMode, showResult, currentPuzzle]);

  const handleTimeout = () => {
    setShowResult(true);
    setSelectedAnswer(null);
  };

  const startGame = (type) => {
    setSelectedType(type);
    setGameMode('playing');
    setCurrentPuzzle(0);
    setScore(0);
    setTimeLeft(60);
    setTotalTime(0);
    setShowResult(false);
    setShowHint(false);
  };

  const handleAnswer = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const puzzle = PUZZLES[selectedType][currentPuzzle];
    const isCorrect = selectedAnswer === puzzle.correct;
    
    if (isCorrect) {
      setScore(score + (showHint ? 5 : 10) + Math.floor(timeLeft / 6));
    }
    
    setShowResult(true);
  };

  const nextPuzzle = () => {
    if (currentPuzzle < PUZZLES[selectedType].length - 1) {
      setCurrentPuzzle(currentPuzzle + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
      setTimeLeft(60);
    } else {
      setGameMode('complete');
    }
  };

  const renderMenu = () => (
    <div className="text-center">
      <div className="mb-8">
        <Brain className="w-20 h-20 mx-auto text-purple-400 mb-4" />
        <h1 className="text-5xl font-bold text-white mb-2">Logic Master</h1>
        <p className="text-purple-300">Sharpen Your Mind with Logic Puzzles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => startGame('sequence')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="text-3xl mb-2">🔢</div>
          <div className="font-bold text-xl mb-1">Number Sequences</div>
          <div className="text-sm text-blue-100">Find patterns in number series</div>
        </button>

        <button
          onClick={() => startGame('pattern')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="text-3xl mb-2">🧩</div>
          <div className="font-bold text-xl mb-1">Pattern Recognition</div>
          <div className="text-sm text-green-100">Identify logical patterns</div>
        </button>

        <button
          onClick={() => startGame('logic')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-bold text-xl mb-1">Logic Problems</div>
          <div className="text-sm text-orange-100">Solve complex logical puzzles</div>
        </button>

        <button
          onClick={() => startGame('deduction')}
          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold text-xl mb-1">Deductive Reasoning</div>
          <div className="text-sm text-pink-100">Use logic to draw conclusions</div>
        </button>
      </div>
    </div>
  );

  const renderGame = () => {
    const puzzle = PUZZLES[selectedType][currentPuzzle];
    const isCorrect = selectedAnswer === puzzle.correct;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className="font-bold">{score} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={timeLeft < 10 ? "text-red-400" : "text-blue-400"} size={20} />
              <span className={font-bold ${timeLeft < 10 ? "text-red-400" : ""}}>{timeLeft}s</span>
            </div>
          </div>
          <div className="text-white/60">
            Puzzle {currentPuzzle + 1}/{PUZZLES[selectedType].length}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 border border-white/20">
          <h2 className="text-2xl text-white mb-6 leading-relaxed">{puzzle.question}</h2>

          <div className="space-y-3">
            {puzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === puzzle.correct
                        ? 'bg-green-500/20 border-green-500 text-green-300'
                        : 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-purple-500/20 border-purple-400 text-white'
                    : showResult && index === puzzle.correct
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    index === puzzle.correct ? (
                      <Check className="text-green-400" size={20} />
                    ) : selectedAnswer === index ? (
                      <X className="text-red-400" size={20} />
                    ) : null
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className={mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-orange-500/20 border border-orange-500'}}>
              <p className={font-bold mb-2 ${isCorrect ? 'text-green-300' : 'text-orange-300'}}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
              </p>
              <p className="text-white/90 text-sm">{puzzle.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!showResult && (
            <>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-yellow-500/40"
              >
                <Lightbulb size={18} />
                {showHint ? 'Hide Hint' : 'Show Hint (-5 pts)'}
              </button>
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                Submit Answer
              </button>
            </>
          )}
          {showResult && (
            <button
              onClick={nextPuzzle}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              {currentPuzzle < PUZZLES[selectedType].length - 1 ? 'Next Puzzle →' : 'See Results'}
            </button>
          )}
        </div>

        {showHint && !showResult && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">💡 Think about the relationship between the elements. Look for mathematical operations, sequences, or logical connections.</p>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="text-center max-w-md mx-auto">
      <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6" />
      <h2 className="text-4xl font-bold text-white mb-4">Challenge Complete!</h2>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 border border-white/20">
        <div className="space-y-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Final Score</p>
            <p className="text-5xl font-bold text-purple-400">{score}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/60 text-sm">Puzzles Solved</p>
              <p className="text-2xl font-bold text-white">{PUZZLES[selectedType].length}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Time</p>
              <p className="text-2xl font-bold text-white">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => startGame(selectedType)}
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
        >
          Play Again
        </button>
        <button
          onClick={() => setGameMode('menu')}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all border border-white/20"
        >
          Main Menu
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {gameMode === 'menu' && renderMenu()}
        {gameMode === 'playing' && renderGame()}
        {gameMode === 'complete' && renderComplete()}
      </div>
    </div>
  );
}