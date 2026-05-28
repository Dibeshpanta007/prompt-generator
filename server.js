const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.OPENAI_API_KEY; 
const API_URL = "https://openai.com"; 
const MODEL_NAME = "gpt-4o-mini"; 

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

        // 1. Direct standard OpenAI layout check
        if (response.data?.choices?.[0]?.message?.content) {
            return res.json({ engineeredPrompt: response.data.choices[0].message.content });
        }

        // 2. Deep recursive text hunter fallback
        // This looks through every key in the API payload to extract text string fields directly
        function searchText(obj) {
            if (!obj || typeof obj !== 'object') return null;
            if (obj.content && typeof obj.content === 'string') return obj.content;
            if (obj.text && typeof obj.text === 'string') return obj.text;
            
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let result = searchText(obj[key]);
                    if (result) return result;
                }
            }
            return null;
        }

        const foundText = searchText(response.data);

        if (foundText) {
            return res.json({ engineeredPrompt: foundText });
        }

        // 3. Ultimate Safety Fallback: Send the whole response stringified to see the layout
        console.log("Raw Response Payload Object Data:", response.data);
        return res.json({ 
            engineeredPrompt: `Structure Mismatch. Raw Data Received:\n${JSON.stringify(response.data, null, 2)}` 
        });

    } catch (error) {
        console.error("❌ BACKEND ERROR DETECTED:", error.message);
        if (error.response) {
            return res.status(error.response.status).json({ 
                error: error.response.data.error?.message || "AI Provider rejected request." 
            });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Server successfully running on http://localhost:${PORT}`));
