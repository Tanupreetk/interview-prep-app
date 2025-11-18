const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ENV_VARS } = require('../config/envVar.js');
const router = express.Router();

router.post('/chat', async (req, res) => {
    // the prompt is being sent like {"message":"hi"}
    const { message } = req.body;
    console.log("user prompt: "+message);
    
    const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    
    try {
        const results = await model.generateContent(message);
        const reply = results.response.text();
        console.log("bot reply: "+reply);   
        res.json({ reply });
    } catch (error) {
        console.error('Error generating reply:', error);
        res.status(500).json({ error: 'Failed to generate reply' });
    }
});
router.post('/generate-questions', async (req, res) => {
    const { techstack, qty, difficulty } = req.body;
    
    if (!qty) {
        return res.status(400).json({ error: 'Quantity of questions is required' });
    }

    const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // const actualDifficulty = difficulty || "random";
    const prompt = `
        Generate ${qty} high-quality interview questions for the topic "${techstack}" at a "${difficulty}" difficulty level.

        IMPORTANT: Your entire response must be a single, valid JSON array of objects. Do not include any text, explanation, or markdown characters like \`\`\`json before or after the array.

        Each object in the array must have the following exact keys:
        - "question_text": A string containing the question.
        - "options": An array of 4 strings for MCQ options. For non-MCQ questions, this can be an empty array [].
        - "answer": A string containing the correct answer.

        Here is an example of the required format:
        [
          {
            "question_text": "What is a closure in JavaScript?",
            "options": [],
            "answer": "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment)."
          },
          {
            "question_text": "What will be the output of console.log(typeof [])?",
            "options": ["'array'", "'object'", "'array-object'", "'undefined'"],
            "answer": "'object'"
          }
        ]
    `;
    try {
        const results = await model.generateContent(prompt);
        let responseText = results.response.text().trim();

        // Clean the response to ensure it's valid JSON
        if (responseText.startsWith("```json")) {
            responseText = responseText.substring(7, responseText.length - 3).trim();
        }

        // Parse the JSON string into a JavaScript array
        const generatedQuestions = JSON.parse(responseText);        
        // Send the structured array to the frontend
        res.json({ questions: generatedQuestions });

    } catch (error) {
        console.error('Error processing AI response:', error);
        res.status(500).json({ error: 'Failed to generate or parse questions' });
    }
});

module.exports = router;