import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Sidebar from "../components/Sidebar.jsx";
import "./Results.scss";

const API_URL = import.meta.env.VITE_API_URL;

const Results = () => {
    const navigate = useNavigate();
    const { id: quizID } = useParams(); // Get quizID from URL params

    // SIMPLIFIED STATE: We only need the final quiz object and a loading state.
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                // FIXED: Call the new, dedicated endpoint to get the results.
                const response = await axios.get(`${API_URL}/api/v1/quiz/results/${quizID}`);
                
                console.log("Quiz Results Received:", response.data.quiz);
                setQuizResult(response.data.quiz);

            } catch (error) {
                console.error('Error fetching quiz results:', error);
                toast.error("Could not load quiz results.");
            } finally {
                setLoading(false);
            }
        };

        if (quizID) {
            fetchResults();
        }
    }, [quizID]);

    // Add loading and error states for a better user experience
    if (loading) {
        return <p>Loading results...</p>;
    }

    if (!quizResult) {
        return <p>Could not find quiz results.</p>;
    }

    // --- RENDER LOGIC ---
    return (
        <div className="main-container">
            <Sidebar />
            <div className="main-content">
                <h1>Quiz Results</h1>
                <h2 className="score-header">Final Score: {quizResult.score} / {quizResult.qty}</h2>
                
                <div className="completion-buttons">
                    <button onClick={() => navigate('/')}>Go to Home</button>
                    <button onClick={() => navigate('/quiz')}>Start New Quiz</button>
                </div>

                <h3 className="responses-header">Your Responses:</h3>
                <div className="results-list">
                    {quizResult.questions.map((question, index) => (
                        <div key={index} className="result-item">
                            <div className="question-text">
                                <p><strong>{index + 1}) {question.question}</strong></p>
                                {question.code_snippet && (
                                    <SyntaxHighlighter language="javascript" style={github}>
                                        {question.code_snippet}
                                    </SyntaxHighlighter>
                                )}
                            </div>
                            <div className="answer-section">
                                <p className={
                                    quizResult.chosen_answers[index] === quizResult.correct_answers[index] 
                                    ? 'correct-answer' 
                                    : 'incorrect-answer'
                                }>
                                    <strong>Your Answer: </strong> 
                                    {quizResult.chosen_answers[index] || "Not Answered"}
                                </p>
                                <p className="correct-answer">
                                    <strong>Correct Answer: </strong> 
                                    {quizResult.correct_answers[index]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Results;