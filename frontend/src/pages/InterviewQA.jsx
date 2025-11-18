import React, { useState } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const InterviewQA = () => {
    const [techstack, setTechstack] = useState('');
    const [qty, setQty] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [questions, setQuestions] = useState([]);
    const [ogResponse, setOgResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/v1/questions/generate-questions`,
                { techstack, qty, difficulty }
            );

            // save raw response for copy/download
            setOgResponse(JSON.stringify(response.data.questions, null, 2));

            const formatted = response.data.questions.map(q => ({
                question_text: marked.parse(q.question_text),
                answer: marked.parse(q.answer),
            }));

            setQuestions(formatted);
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error("Error fetching questions:", error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(ogResponse).then(() => {
            alert("Questions copied!");
        });
    };

    const downloadAsTxt = () => {
        const element = document.createElement('a');
        const file = new Blob([ogResponse], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'questions.txt';
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="main-container">
            <Sidebar />
            <Chatbot />

            <div className="main-content">
                <h1>Interview Q/A Suggestion</h1>

                {/* Input Form */}
                <div className="questions">
                    <form className="input-fields" onSubmit={handleSubmit}>
                        
                        <div>
                            <label>Topic:</label>
                            <input
                                type="text"
                                value={techstack}
                                required
                                placeholder="Enter topic"
                                onChange={(e) => setTechstack(e.target.value)}
                            />
                        </div>

                        <div>
                            <label>Number of Questions:</label>
                            <input
                                type="number"
                                value={qty}
                                required
                                placeholder="No. of Qs"
                                onChange={(e) => setQty(e.target.value)}
                            />
                        </div>

                        <div>
                            <label>Difficulty:</label>
                            <select
                                value={difficulty}
                                required
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="">Select Difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <button className="generate-questions" type="submit">
                            Generate Questions
                        </button>
                    </form>
                </div>

                {/* Copy & Download */}
                <div className="flex flex-row justify-end m-2">
                    <button className="btn" onClick={downloadAsTxt}>
                        Download as .txt
                    </button>
                    <button className="btn" onClick={copyToClipboard}>
                        Copy to Clipboard
                    </button>
                </div>

                {/* Loader */}
                {loading && (
                    <p className="text-center mt-4">⏳ Generating questions...</p>
                )}

                {/* Questions Display */}
                <div className="questions-container mt-4">
                    {questions.map((q, index) => (
                        <div 
                            key={index}
                            className="question-block p-4 mb-4 border rounded"
                        >
                            <h3 className="font-bold">
                                Q{index + 1}.
                            </h3>

                            <div
                                dangerouslySetInnerHTML={{ __html: q.question_text }}
                                className="question-text mt-2"
                            />

                            <div
                                dangerouslySetInnerHTML={{ __html: q.answer }}
                                className="answer-text mt-2"
                            />

                            <hr className="mt-4" />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default InterviewQA;
