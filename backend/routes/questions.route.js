const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ENV_VARS } = require('../config/envVar.js');
const router = express.Router();

/**
 * Route for the chatbot functionality.
 * Expects: { "message": "user's prompt" }
 * Responds: { "reply": "chatbot's response" }
 */
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    console.log("User prompt for chatbot: " + message);
    
    const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    try {
        const results = await model.generateContent(message);
        const reply = results.response.text();
        console.log("Bot reply: " + reply);   
        res.json({ reply });
    } catch (error) {
        console.error('Error generating chat reply:', error);
        res.status(500).json({ error: 'Failed to generate chat reply' });
    }
});


/**
 * Route for generating a list of interview Q&A.
 * This is the corrected version that returns structured JSON data.
 * Expects: { techstack, qty, difficulty }
 * Responds: { questions: [ { question_text: "...", answer: "..." }, ... ] }
 */
router.post('/generate-questions', async (req, res) => {
    const { techstack, qty, difficulty } = req.body;
    
    if (!qty) {
        return res.status(400).json({ error: 'Quantity of questions is required' });
    }

    const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const actualDifficulty = difficulty || "random";

    // This prompt instructs the AI to return a clean JSON array, which is the best practice.
    const prompt = `
       Generate exactly ${qty} high-quality interview questions for the topic "${techstack}" at a "${difficulty}" difficulty level based on Indian interview standards.

Your entire response must be ONLY a valid JSON array. 
Do NOT include any explanation, extra text, comments, or markdown formatting.

Each element in the array must be an object with the following keys:
{
  "question_text": "The interview question as a string.",
  "answer": "A detailed and well-structured answer as a string."
}
Ensure:
- The JSON is valid and parsable.
- All values are non-empty strings.
- Do NOT wrap the JSON in backticks.
- Do NOT include trailing commas.

    `;

    console.log("Sending JSON-requesting prompt to AI...");

    try {
        const results = await model.generateContent(prompt);
        let responseText = results.response.text().trim();

        // Clean the response to ensure it's valid JSON, removing potential markdown wrappers.
        if (responseText.startsWith("```json")) {
            responseText = responseText.substring(7, responseText.length - 3).trim();
        } else if (responseText.startsWith("```")) {
             responseText = responseText.substring(3, responseText.length - 3).trim();
        }

        // Parse the JSON string into a JavaScript array.
        const generatedQuestions = JSON.parse(responseText);

        console.log("Successfully parsed JSON from AI. Sending structured data to frontend.");
        
        // Send the structured array to the frontend.
        res.json({ questions: generatedQuestions });

    } catch (error) {
        console.error('Error processing AI response:', error);
        res.status(500).json({ error: 'Failed to generate or parse questions' });
    }
});


module.exports = router;