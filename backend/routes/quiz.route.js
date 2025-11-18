const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ENV_VARS } = require('../config/envVar.js');
const Quiz = require('../models/Quiz.js');
const connectToMongo = require('../connectDb.js');

const router = express.Router();
    
router.post('/create-quiz-session', async (req, res) => {
    await connectToMongo();

    const  { userID, qty, techstack, difficulty } = req.body;
    
    // --- AI Generation Logic Moved Here ---
    const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an Interview Quiz Question Generator. Generate ${qty} unique MCQ interview questions (with code snippets if necessary) with answers for the topic: ${techstack} at ${difficulty} level difficulty according to Indian IT industry standards. 
    Give your response in a single, valid JSON array of objects format. Each object should be structured as follows:
    {
      "question": "...",
      "code_snippet": "...",
      "options": ["...", "...", "...", "..."],
      "is_code_options": boolean,
      "correct": "...",
      "correctIndex": number
    }
    Ensure the entire output is just the JSON array, with no extra text or markdown wrappers.`;

    try {
        const results = await model.generateContent(prompt);
        const responseText = results.response.text().replace(/```json|```/g, '').trim();
        const allQuestions = JSON.parse(responseText);

        const newQuiz = new Quiz({
            userID,
            qty,
            questions: allQuestions.map(q => ({ // Store only the non-answer parts
                question: q.question,
                code_snippet: q.code_snippet,
                options: q.options,
                is_code_options: q.is_code_options
            })),
            correct_answers: allQuestions.map(q => q.correct),
            correct_answers_index: allQuestions.map(q => q.correctIndex),
        });

        await newQuiz.save();
        const quizID = newQuiz._id;
        console.log("Generated all questions for quizID:", quizID);
        res.json({ quizID: quizID });

    } catch(error) {
        console.error('Error generating bulk questions:', error);
        res.status(500).json({ error: 'Failed to create quiz session' });
    }
});

router.post('/get-quiz-question', async (req, res) => {
    const { quizID, qsNo } = req.body; // qsNo is now 1-based index
    if (!quizID || !qsNo) {
        return res.status(400).json({ error: 'Missing quizID or question number' });
    }

    try {
        await connectToMongo();
        const quiz = await Quiz.findById(quizID).select('questions qty');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        if (qsNo > quiz.qty) {
            return res.json({ hasMoreQuestions: false });
        }
        
        // Fetch the specific question from the pre-generated array.
        // Adjust for 0-based array index.
        const question = quiz.questions[qsNo - 1]; 

        res.json({ question: question, hasMoreQuestions: true });

    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});


router.post('/save-answer', async (req, res) => {
    await connectToMongo();

    const { selectedAnswer, selectedIndex, quizID } = req.body;
    console.log("selectedAnswer:", selectedAnswer);
    console.log("selectedIndex:", selectedIndex);
    console.log("quizID:", quizID);
    try {
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        quiz.chosen_answers.push(selectedAnswer);
        quiz.chosen_answers_index.push(selectedIndex);

        await quiz.save();
        res.json({ message: 'Answer submitted successfully' });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

router.post('/evaluate-answer', async (req, res) => {
    await connectToMongo();

    const { userID, quizID } = req.body;
    const quiz = await Quiz.findById(quizID);
    const correctAnswers = quiz.correct_answers_index;
    const userAnswers = quiz.chosen_answers_index;
    const score = correctAnswers.filter((answer, index) => answer === userAnswers[index]).length;       
    console.log("score:", score);
    quiz.score = score;
    quiz.status = 'Completed';
    await quiz.save();
    console.log("quiz:", quiz);
    res.json({ quiz });
});

router.post('/terminate-quiz', async (req, res) => {
    await connectToMongo();

    const { quizID } = req.body;
    await Quiz.findByIdAndDelete(quizID);
    res.json({ message: 'Quiz terminated successfully' });
});

router.get('/quiz-state/:quizID', async (req, res) => {
    await connectToMongo();
    try {
        const { quizID } = req.params;
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json({ quiz });
    } catch (error) {
        console.error('Error fetching quiz state:', error);
        res.status(500).json({ error: 'Failed to fetch quiz state' });
    }
});
router.get('/results/:quizID', async (req, res) => {
    await connectToMongo();
    try {
        const { quizID } = req.params;
        const quiz = await Quiz.findById(quizID);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz results not found' });
        }
        res.json({ quiz });

    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
});


module.exports = router;