import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompletionScreen = ({ score, totalQuestions }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleRestartQuiz = () => {
        navigate('/interview-quiz');
    };

    return (
        <div className="completion-screen">
            <h2>Quiz Completed!</h2>
            <h3>Your Score: {score} / {totalQuestions}</h3>
            <div className="completion-buttons">
                <button onClick={handleGoHome}>Go to Home</button>
                <button onClick={handleRestartQuiz}>Restart Quiz</button>
            </div>
        </div>
    );
};

export default CompletionScreen;