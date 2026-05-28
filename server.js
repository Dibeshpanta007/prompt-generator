const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pointing to Groq's super-fast infrastructure
const API_KEY = process.env.OPENAI_API_KEY; 
const API_URL = "https://groq.com"; 
const MODEL_NAME = "llama-3.3-70b-specdec"; // Extremely fast and smart free tier model

app.post('/api/generate-prompt', async (req, res) => {
    const userIdea = req.body.idea;

    const systemInstruction = `You are an expert Prompt Engineer. Your job is to take a simple user idea and turn it into a high-quality, structured, professional prompt that the user can copy and paste into tools like ChatGPT or Claude. Do not include introductory text, conversational filler, or wrap the response in markdown code blocks. Output ONLY the finalized prompt text. Use clear structural headings like [Role], [Context], [Task], and [Constraints].`;

    try {
        const response = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Transform this basic idea into an engineered prompt: ${userIdea}` }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        // Exact response extraction layer
        if (response.data?.choices?.[0]?.message?.content) {
            return res.json({ engineeredPrompt: response.data.choices[0].message.content });
        }

        res.status(500).json({ error: "Could not read text content from the AI provider response." });

    } catch (error) {
        console.error("❌ BACKEND ERROR:", error.message);
        if (error.response) {
            return res.status(error.response.status).json({ 
                error: typeof error.response.data === 'string' ? "Provider returned an HTML page instead of JSON." : (error.response.data.error?.message || "AI API rejection.")
            });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Server successfully running on http://localhost:${PORT}`));
