const express = require('express');
const { GoogleGenAI } = require('@google/genai'); 
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize the new Gemini SDK with your custom API key
const ai = new GoogleGenAI({ 
    apiKey: "AQ.Ab8RN6Ip05hJJFY-AAVKtKbBfg6jwspJvHCY53nPsqPDu3wP2w" 
}); 

app.post('/api/analyze-phishing', async (req, res) => {
    try {
        const prompt = `Analyze this email for phishing, spoofing, and social engineering. 
        Respond strictly in valid JSON format matching this exact schema:
        {
            "verdict": "Safe" | "Suspicious" | "Phishing",
            "urgency_tone": "Low" | "Medium" | "High",
            "explanation": "Brief 1-sentence tactical analysis.",
            "suspicious_terms": ["exact phrase 1", "exact phrase 2"],
            "url_analysis": [{"url": "extracted link", "risk": "Low" | "Medium" | "High"},
            "score": 0,]
        }
        
        Email Content:
        ${req.body.text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
                temperature: 0.1, // Near-zero variance for strict JSON extraction
                responseMimeType: "application/json"
            }
        });
        
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("Phishing Analysis API Error:", error);
        res.status(500).json({ error: 'Failed to analyze threat vector.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
