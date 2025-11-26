import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useStore } from '../store/store';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const QuizLobby = () => {
    const { id: roomID } = useParams();
    const { user } = useStore();
    const [lobby, setLobby] = useState(null);
    const [socket, setSocket] = useState(null); // State to hold the socket instance
    const [isHost, setIsHost] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io(API_URL, {
            transports: ['websocket'],
            upgrade: false,
        });
        setSocket(newSocket); // Save the socket instance to state

        const handleLobbyUpdated = (lobbyState) => {
            console.log("[CLIENT] Received 'server:lobby_updated'", lobbyState);
            setLobby(lobbyState);
            // Check if the current user is the host
            if(newSocket.id === lobbyState.host) {
                setIsHost(true);
            }
        };
        
        newSocket.on("server:lobby_updated", handleLobbyUpdated);

        newSocket.on('connect', () => {
            console.log(`[CLIENT] Connected with ID: ${newSocket.id}`);
            console.log(`[CLIENT] Emitting 'client:join_quiz_lobby' for room: ${roomID}`);
            newSocket.emit("client:join_quiz_lobby", { roomID, user });
        });

        // ... (other listeners like quiz_started would go here)
        newSocket.on("server:quiz_started", (data) => {
            navigate(`/quiz/play/${roomID}`, { state: { questionsCount: data.questionsCount } });
        });

        return () => {
            console.log("[CLIENT] Disconnecting socket...");
            newSocket.disconnect();
        };
    }, [roomID, user, navigate]);

    const startQuiz = async () => {
        if (!isHost) return; // Only host can start
        try {
            const response = await axios.post(`${API_URL}/api/v1/quiz/create-quiz-session`, {
                userID: user._id, qty: 5, techstack: 'JavaScript', difficulty: 'Medium',
            });
            const quizID = response.data.quizID;
            const quizResponse = await axios.get(`${API_URL}/api/v1/quiz/results/${quizID}`);
            
            // Emit the start event from the client
            socket.emit("client:start_quiz", { roomID, quizData: quizResponse.data.quiz });

        } catch (error) {
            console.error("Failed to create and start quiz:", error);
        }
    };
    
    if (!lobby) {
        return <div><p>Joining lobby...</p><p>If this takes too long, check the server connection.</p></div>;
    }

    return (
        <div>
            <h1>Quiz Lobby: {roomID}</h1>
            <p>Share this Room ID with others to join!</p>
            <hr />
            <h2>Players in Lobby ({lobby.players.length}):</h2>
            <ul>
                {lobby.players.map(p => (
                    <li key={p.id}>
                        {p.name} {p.id === lobby.host ? '(Host)' : ''}
                    </li>
                ))}
            </ul>

            {isHost && (
                <button onClick={startQuiz}>Start Quiz for Everyone</button>
            )}

            {!isHost && <p>Waiting for the host to start the quiz...</p>}
        </div>
    );
};

export default QuizLobby;