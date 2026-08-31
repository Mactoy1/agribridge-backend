"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const genai_1 = require("@google/genai");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const ai = new genai_1.GoogleGenAI({ apiKey: env_1.env.geminiApiKey });
router.post('/forecast', async (req, res) => {
    try {
        const { crop, region, market } = req.body;
        if (!env_1.env.geminiApiKey) {
            return res.status(400).json({
                message: 'Gemini API key is not configured',
                fallback: {
                    summary: 'This is a sample forecast for the AgriBridge market.',
                    recommendation: 'Use crop demand patterns and seasonal supply trends to guide selling decisions.',
                },
            });
        }
        const prompt = `You are an agricultural market AI assistant. Give a concise forecast for ${crop || 'crop'} in ${region || 'this region'} for ${market || 'local market'}. Include likely demand trend, price outlook, and recommended action.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });
        return res.json({
            summary: response.text || 'Forecast generated successfully',
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'AI forecast generation failed' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map