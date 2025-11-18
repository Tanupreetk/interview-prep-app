import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Quiz.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const Quiz = () => {
    
    const { id: quizID } = useParams();
    const navigate = useNavigate();
    const { user } = useStore();

    const [question, setQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [quizDetails, setQuizDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        const storedQuizDetails = JSON.parse(localStorage.getItem('quizDetails'));
        if (storedQuizDetails && storedQuizDetails.quizID === quizID) {
            setQuizDetails(storedQuizDetails);
        } else {
            toast.error('Quiz details not found!');
            navigate('/quiz');
        }
    }, [quizID, navigate]);

    useEffect(() => {
        if (quizDetails && questionNumber <= quizDetails.qty) {
            fetchQuestion();
        }
    }, [quizDetails, questionNumber]);

    useEffect(() => {
        if (isCompleted) return;
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        if (timer === 0) {
            handleNextQuestion();
        }
        return () => clearInterval(countdown);
    }, [timer, isCompleted]);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelectedOption(null);
        try {
            const response = await axios.post(`${API_URL}/api/v1/quiz/get-quiz-question`, {
                quizID,
                qsNo: questionNumber,
            });

            console.log("Received question data:", response.data); // DEBUG LOG

            if (response.data.hasMoreQuestions === false) {
                evaluateQuiz();
            } else {
                setQuestion(response.data.question);
                setTimer(60);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            toast.error('Failed to fetch the next question.');
            setLoading(false);
        }
    };

    const handleNextQuestion = async () => {
        if (loading) return;

        // Save the answer for the current question
        if (selectedOption !== null) {
            await axios.post(`${API_URL}/api/v1/quiz/save-answer`, {
                quizID,
                selectedAnswer: selectedOption.option,
                selectedIndex: selectedOption.index,
            });
        }

        // Decide whether to fetch the next question or finish the quiz
        if (questionNumber >= quizDetails.qty) {
            evaluateQuiz();
        } else {
            // This will trigger the useEffect to fetch the next question
            setQuestionNumber(prev => prev + 1);
        }
    };

    const handleQuitTest = async () => { 
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
            try {
                await axios.post(`${API_URL}/api/v1/quiz/terminate-quiz`, { quizID });
                localStorage.removeItem('quizDetails');
                toast.success('Quiz terminated.');
                navigate('/quiz');
            } catch (error) {
                console.error('Error terminating quiz:', error);
                toast.error('Failed to terminate the quiz. Please try again.');
            }
        }
     };

    const evaluateQuiz = async () => {
        if (isCompleted) return;
        setIsCompleted(true);
        try {
            await axios.post(`${API_URL}/api/v1/quiz/evaluate-answer`, {
                userID: user._id,
                quizID,
            });
            localStorage.removeItem('quizDetails');
            navigate(`/results/${quizID}`);
        } catch (error) {
            console.error('Error evaluating quiz:', error);
        }
    };

    if (loading || !question) {
        return <p>Loading question...</p>;
    }

    return (
        <div className="quiz-screen">
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
                    {questionNumber == quizDetails.qty ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default Quiz;