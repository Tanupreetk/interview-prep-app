import React from "react";
import './Overview.scss';
import Sidebar from '../components/Sidebar.jsx';
import { useStore } from '../store/store.js';
import Chatbot from '../components/Chatbot.jsx';
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Import icons for a better UI
import { FaBook, FaBrain, FaHistory } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useStore();
  const navigate = useNavigate(); // Hook for navigation

  // --- Placeholder Data ---
  // In the future, you will fetch this data from your backend API
  const performanceStats = {
    quizzesTaken: 5,
    averageScore: 85,
    qaSessions: 3,
  };

  const recentActivities = [
    { type: 'Quiz', topic: 'Python (Easy)', score: '8/10', path: '/results/some-id' },
    { type: 'Q/A', topic: 'Behavioral Session', score: '5 questions', path: '/qa' },
    { type: 'Quiz', topic: 'JavaScript (Hard)', score: '6/10', path: '/results/some-id' },
  ];

  return (
    <>
      <Chatbot />
      <div className="overview-container">
        <Sidebar />
        <div className="main-content">
          <header>
            <h2>
              Hi, {user.name}, welcome to <span className="font-bold">IntervuAI</span>
            </h2>
          </header>
          <div className="dashboard-grid">
            <div className="quick-start-cards">
              <div className="action-card" onClick={() => navigate('/qa')}>
                <FaBook className="card-icon" />
                <h3>Practice Q/A</h3>
                <p>Hone your answers with our AI interviewer.</p>
                <button className="card-button">Start a Session</button>
              </div>
              <div className="action-card" onClick={() => navigate('/quiz')}>
                <FaBrain className="card-icon" />
                <h3>Take an AI Quiz</h3>
                <p>Test your technical knowledge on any topic.</p>
                <button className="card-button">Start a New Quiz</button>
              </div>
            </div>
            <div className="performance-snapshot dashboard-card">
              <h3>Performance Snapshot</h3>
              <div className="stat-item">
                <span className="stat-value">{performanceStats.quizzesTaken}</span>
                <span className="stat-label">Quizzes Taken</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{performanceStats.averageScore}%</span>
                <span className="stat-label">Average Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{performanceStats.qaSessions}</span>
                <span className="stat-label">Q/A Sessions</span>
              </div>
            </div>

            <div className="recent-activity dashboard-card">
              <h3><FaHistory /> Recent Activity</h3>
              <ul>
                {recentActivities.map((activity, index) => (
                  <li key={index} onClick={() => navigate(activity.path)}>
                    <span className="activity-type">{activity.type}:</span>
                    <span className="activity-topic">{activity.topic}</span>
                    <span className="activity-score">{activity.score}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div> {/* End of dashboard-grid */}
          <div className="feedback-section dashboard-card">
            <div className="feedback-content">
              <h3>Interview Feedback Request</h3>
              <p>Request feedback from your interviewer or practice partner:</p>
              <form className="feedback-form">
                <textarea
                  rows="4"
                  placeholder="Enter your feedback request message..."
                ></textarea>
                <button className="submit-feedback font-bold">Request Feedback</button>
              </form>
            </div>
          </div>
          {/* <div className="games-section dashboard-card">
            <h3>🎮 Interactive Games</h3>
            <p>Take a short break and sharpen your brain with fun mini-games!</p>

            <div className="games-grid">

              <div className="game-card">
                <h4>Rock Paper Scissors</h4>
                <p>Classic quick decision game.</p>
                <button
                  onClick={() => navigate("/games/rps")}
                  className="game-button"
                >
                  Play
                </button>
              </div>

              <div className="game-card">
                <h4>Guess the Number</h4>
                <p>Guess a number between 1–10!</p>
                <button
                  onClick={() => navigate("/games/guess-number")}
                  className="game-button"
                >
                  Play
                </button>
              </div>

              <div className="game-card">
                <h4>Flash Cards</h4>
                <p>Quick memory challenge.</p>
                <button
                  onClick={() => navigate("/games/flash-cards")}
                  className="game-button"
                >
                  Play
                </button>
              </div>

            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;