const express = require('express');
const path = require('path');
const axios = require('axios'); // Upgraded network library
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Paste your real key here!
const API_KEY = process.env.OPENAI_API_KEY; 
const API_URL = "https://openai.com"; 
const MODEL_NAME = "gpt-4o-mini"; 

app.post('/api/generate-prompt', async (req, res) => {
    const userIdea = req.body.idea;

    const systemInstruction = `You are an expert Prompt Engineer. Your job is to take a simple user idea and turn it into a high-quality, structured, professional prompt that the user can copy and paste into tools like ChatGPT or Claude. Do not include introductory text, conversational filler, or wrap the response in markdown code blocks. Output ONLY the finalized prompt text. Use clear structural headings like [Role], [Context], [Task], and [Constraints].`;

    try {
        // Axios handles the configuration and errors much more reliably
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

        const engineeredPrompt = response.data.choices[0].message.content;
        res.json({ engineeredPrompt });

    } catch (error) {
        // This will print the exact, specific error directly onto your terminal screen!
        console.error("❌ BACKEND ERROR DETECTED:");
        if (error.response) {
            console.error("Status Data:", error.response.data);
            return res.status(error.response.status).json({ 
                error: error.response.data.error?.message || "AI Provider rejected request." 
            });
        } else {
            console.error("Message:", error.message);
            return res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Server successfully running on http://localhost:${PORT}`));
