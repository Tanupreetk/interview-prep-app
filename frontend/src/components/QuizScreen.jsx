import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';
import CompletionScreen from './CompletionScreen';

const API_URL = import.meta.env.VITE_API_URL;

const QuizScreen = () => {
    const { quizID } = useParams();
    const navigate = useNavigate();
    const { user } = useStore();

    const [question, setQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [quizDetails, setQuizDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60); // 60 seconds per question

    useEffect(() => {
        const storedQuizDetails = JSON.parse(localStorage.getItem('quizDetails'));
        if (storedQuizDetails && storedQuizDetails.quizID === quizID) {
            setQuizDetails(storedQuizDetails);
        } else {
            toast.error('Quiz details not found!');
            navigate('/');
        }
    }, [quizID, navigate]);

    useEffect(() => {
        if (quizDetails) {
            fetchQuestion();
        }
    }, [quizDetails, questionNumber]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        if (timer === 0) {
            handleNextQuestion();
        }

        return () => clearInterval(countdown);
    }, [timer]);

    const fetchQuestion = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/v1/quiz/generate-quiz`, {
                ...quizDetails,
                userID: user._id,
                qsNo: questionNumber,
            });

            if (response.data.hasMoreQuestions === false) {
                evaluateQuiz();
            } else {
                setQuestion(response.data.question);
                setSelectedOption(null);
                setTimer(60); // Reset timer for new question
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            toast.error('Failed to fetch question.');
            setLoading(false);
        }
    };

    const handleNextQuestion = async () => {
        if (selectedOption !== null) {
            await axios.post(`${API_URL}/api/v1/quiz/save-answer`, {
                quizID,
                selectedAnswer: selectedOption.option,
                selectedIndex: selectedOption.index,
            });
        }
        setQuestionNumber((prev) => prev + 1);
    };

    const handleQuitTest = async () => {
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
            try {
                await axios.post(`${API_URL}/api/v1/quiz/terminate-quiz`, { quizID });
                localStorage.removeItem('quizDetails');
                toast.success('Quiz terminated.');
                navigate('/');
            } catch (error) {
                console.error('Error terminating quiz:', error);
                toast.error('Failed to terminate quiz.');
            }
        }
    };

    const evaluateQuiz = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/quiz/evaluate-answer`, {
                userID: user._id,
                quizID,
            });
            setScore(response.data.quiz.score);
            setIsCompleted(true);
            localStorage.removeItem('quizDetails');
        } catch (error) {
            console.error('Error evaluating quiz:', error);
        }
    };

    if (isCompleted) {
        return <CompletionScreen score={score} totalQuestions={quizDetails.qty} />;
    }

    return (
        <div className="quiz-screen">
            {loading ? (
                <p>Loading question...</p>
            ) : (
                <>
                    <div className="quiz-header">
                        <h2>Question {questionNumber} of {quizDetails.qty}</h2>
                        <div className="timer">Time Left: {timer}s</div>
                    </div>
                    <div className="question-container">
                        <p>{question.question}</p>
                        {question.code_snippet && (
                            <SyntaxHighlighter language="javascript" style={base16AteliersulphurpoolLight}>
                                {question.code_snippet}
                            </SyntaxHighlighter>
                        )}
                    </div>
                    <div className="options-container">
                        {question.options.map((option, index) => (
                            <div key={index} className={`option ${selectedOption?.index === index ? 'selected' : ''}`}
                                 onClick={() => setSelectedOption({ option, index })}>
                                <input type="radio" id={`option-${index}`} name="options"
                                       checked={selectedOption?.index === index} readOnly/>
                                <label htmlFor={`option-${index}`}>
                                    {question.is_code_options ? (
                                        <SyntaxHighlighter language="javascript" style={base16AteliersulphurpoolLight}>
                                            {option}
                                        </SyntaxHighlighter>
                                    ) : (
                                        option
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="quiz-footer">
                        <button onClick={handleQuitTest} className="quit-btn">Quit Test</button>
                        <button onClick={handleNextQuestion} disabled={selectedOption === null}
                                className="next-btn">
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default QuizScreen;