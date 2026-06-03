const express = require('express');
const path = require('path');
const Groq = require('groq-sdk'); 
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/api/generate-prompt', async (req, res) => {
    const userIdea = req.body.idea;

    const systemInstruction = `You are an expert Prompt Engineer. Your job is to take a simple user idea and turn it into a high-quality, structured, professional prompt that the user can copy and paste into tools like ChatGPT or Claude. Do not include introductory text, conversational filler, or wrap the response in markdown code blocks. Output ONLY the finalized prompt text. Use clear structural headings like [Role], [Context], [Task], and [Constraints].`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Transform this basic idea into an engineered prompt: ${userIdea}` }
            ],
            model: "llama-3.3-70b-versatile", 
            temperature: 0.7
        });

        const content = chatCompletion.choices[0]?.message?.content;

        if (content) {
            return res.json({ engineeredPrompt: content });
        } else {
            return res.status(500).json({ error: "Received an empty completion response from Groq." });
        }

    } catch (error) {
        console.error("❌ SDK BACKEND ERROR:", error.message);

        return res.status(500).json({ error: `Groq SDK Error: ${error.message}` });
    }
});

app.listen(PORT, () => console.log(`🚀 
