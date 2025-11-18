import React, { useState, useEffect } from 'react';
import './InterviewQuiz.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { useStore } from '../store/store.js';
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from 'react-toastify';
import Chatbot from '../components/Chatbot.jsx';

const InterviewQuiz = () => {
    const { user } = useStore();
    const userID = user._id;
    const navigate = useNavigate();

    const [techstack, setTechstack] = useState('');
    const [qty, setQty] = useState(3); // Default to a reasonable number
    const [difficulty, setDifficulty] = useState('');
    const [ongoingQuiz, setOngoingQuiz] = useState(null);
    const [isCreating, setIsCreating] = useState(false); // State for the initial loading

    useEffect(() => {
        const checkOngoingQuiz = () => {
            const quizDetails = JSON.parse(localStorage.getItem('quizDetails') || 'null');
            if (quizDetails) {
                setOngoingQuiz(quizDetails);
            }
        };
        checkOngoingQuiz();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ongoingQuiz) {
            toast.error('You have an ongoing quiz. Please complete or terminate it first.');
            return;
        }

        setIsCreating(true); // Start loading
        try {
            const response = await axios.post(`${API_URL}/api/v1/quiz/create-quiz-session`, {
                userID,
                qty,
                techstack,
                difficulty,
            });

            const id = response.data.quizID;
            localStorage.setItem('quizDetails', JSON.stringify({ quizID: id, techstack, qty, difficulty }));
            navigate(`/quiz/${id}`); // Navigate to the quiz page

        } catch (error) {
            console.error('Error creating quiz session:', error);
            toast.error('Could not create the quiz. Please try again.');
        } finally {
            setIsCreating(false); // Stop loading, regardless of success or failure
        }
    };

    const handleTerminate = async () => {
        try {
            const quizDetails = JSON.parse(localStorage.getItem('quizDetails'));
            if (quizDetails) {
                await axios.post(`${API_URL}/api/v1/quiz/terminate-quiz`, { quizID: quizDetails.quizID });
                localStorage.removeItem('quizDetails');
                setOngoingQuiz(null);
                toast.success('Quiz terminated successfully!');
            } else {
                toast.error('No ongoing quiz found');
            }
        } catch (error) {
            console.error('Error terminating quiz:', error);
        }
    };

    const handleResumeQuiz = () => {
        navigate(`/quiz/${ongoingQuiz.quizID}`);
    };

    return (
        <div className='main-container'>
            <Sidebar />
            <Chatbot />
            <div className='main-content'>
                <h1>Interview Quiz</h1>

                {ongoingQuiz ? (
                    <div className="resume-quiz-container">
                        <h2>You have an ongoing quiz.</h2>
                        <button onClick={handleResumeQuiz} className="resume-btn">Resume Quiz</button>
                        <button onClick={handleTerminate} className="terminate-btn">Terminate Quiz</button>
                    </div>
                ) : (
                    <div className='questions'>
                        <form className='input-fields' onSubmit={handleSubmit}>
                            {/* Form fields remain the same */}
                            <div>
                                <label>Topic:</label>
                                <input type="text" value={techstack} placeholder="Enter the topic" required onChange={(e) => setTechstack(e.target.value)} />
                            </div>
                            <div>
                                <label>Number of Questions:</label>
                                <input type="number" value={qty} placeholder="No. of Qs" required onChange={(e) => setQty(e.target.value)} min="1" />
                            </div>
                            <div>
                                <label>Difficulty:</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                                    <option value="">Select Difficulty</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            
                            {/* CHANGED: Button now shows loading state */}
                            <button className='generate-questions' type="submit" disabled={isCreating}>
                                {isCreating ? 'Generating Quiz...' : 'Start Quiz'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewQuiz;