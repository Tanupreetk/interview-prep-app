// frontend/src/pages/MultiplayerQuiz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

const MultiplayerQuiz = () => {
    const { id: roomID } = useParams();
    const socketRef = useRef();
    const [question, setQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [quizState, setQuizState] = useState('question'); // 'question', 'result', 'finished'
    const [result, setResult] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        socketRef.current = io.connect(API_URL);

        socketRef.current.on("server:next_question", ({ question, questionNumber }) => {
            setQuestion({ ...question, number: questionNumber });
            setSelectedAnswer(null);
            setResult(null);
            setQuizState('question');
        });

        socketRef.current.on("server:answer_result", ({ correctIndex, players }) => {
            setResult({ correctIndex });
            setLeaderboard(players);
            setQuizState('result');
        });
        
        socketRef.current.on("server:quiz_finished", ({ players }) => {
            setLeaderboard(players);
            setQuizState('finished');
        });

        return () => socketRef.current.disconnect();
    }, []);

    const submitAnswer = (index) => {
        setSelectedAnswer(index);
        socketRef.current.emit("client:submit_answer", { roomID, answerIndex: index });
    };

    if (quizState === 'finished') {
        return <div>
            <h2>Quiz Finished!</h2>
            <h3>Final Leaderboard:</h3>
            <ul>{leaderboard.map(p => <li key={p.id}>{p.name}: {p.score}</li>)}</ul>
        </div>
    }

    return (
        <div>
            {question && <h2>Question {question.number}: {question.question}</h2>}
            
            {quizState === 'question' && question && (
                <ul>
                    {question.options.map((option, index) => (
                        <li key={index}>
                            <button 
                                onClick={() => submitAnswer(index)} 
                                disabled={selectedAnswer !== null}
                                style={{backgroundColor: selectedAnswer === index ? 'lightblue' : 'white'}}
                            >
                                {option}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {quizState === 'result' && result && (
                <div>
                    <h3>Results</h3>
                    <p>The correct answer was: {question.options[result.correctIndex]}</p>
                    <h4>Current Leaderboard:</h4>
                    <ul>{leaderboard.map(p => <li key={p.id}>{p.name}: {p.score}</li>)}</ul>
                </div>
            )}
        </div>
    );
};

export default MultiplayerQuiz;