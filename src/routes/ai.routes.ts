import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey || '' });

const fallbackForecast = (crop: string, region: string, market: string) => ({
  summary: `Market forecast for ${crop} in ${region}`,
  recommendation: 'Use crop demand patterns and seasonal supply trends to guide selling decisions.',
  trend: 'STABLE',
  priceOutlook: 'Monitor market conditions',
  confidence: 'LOW (Demo mode - no API key configured)',
});

// Get weather-based forecast
router.post('/forecast', authMiddleware, async (req, res) => {
  try {
    const { crop, region, market } = req.body;

    if (!crop || !region) {
      return res.status(400).json({
        message: 'Crop and region are required',
        fields: { crop: !crop, region: !region },
      });
    }

    // Check if API key is configured
    if (!env.geminiApiKey) {
      console.warn('Gemini API key not configured, returning fallback forecast');
      return res.json({
        message: 'Forecast (Demo mode)',
        forecast: fallbackForecast(crop, region, market || 'local'),
      });
    }

    try {
      const prompt = `You are an agricultural market AI assistant. Provide a concise JSON forecast for ${crop} in ${region}${market ? ` for ${market}` : ''} market. 
      Include: summary (brief forecast), recommendation (action to take), trend (UP/DOWN/STABLE), priceOutlook (price prediction), confidence (HIGH/MEDIUM/LOW).
      Respond only with valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      let forecast;
      try {
        forecast = JSON.parse(response.text || '{}');
      } catch {
        forecast = {
          summary: response.text || 'Forecast generated successfully',
          recommendation: 'Monitor market trends',
          trend: 'STABLE',
        };
      }

      return res.json({
        message: 'Forecast generated successfully',
        forecast,
      });
    } catch (apiError) {
      console.error('[AI_FORECAST_API_ERROR]', apiError);
      return res.json({
        message: 'Forecast (Fallback)',
        forecast: fallbackForecast(crop, region, market || 'local'),
      });
    }
  } catch (error) {
    console.error('[AI_FORECAST_ERROR]', error);
    return res.status(500).json({ message: 'Failed to generate forecast' });
  }
});

// Get AI insights
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const { category, skip = '0', take = '10' } = req.query;

    const where = category ? { category: String(category) } : {};

    const [insights, total] = await Promise.all([
      prisma.aIInsight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Math.min(Number(take), 50),
      }),
      prisma.aIInsight.count({ where }),
    ]);

    return res.json({
      data: insights,
      pagination: {
        total,
        skip: Number(skip),
        take: Number(take),
        hasMore: Number(skip) + Number(take) < total,
      },
    });
  } catch (error) {
    console.error('[AI_INSIGHTS_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch insights' });
  }
});

// Get single insight
router.get('/insights/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);

    const insight = await prisma.aIInsight.findUnique({ where: { id } });

    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    return res.json(insight);
  } catch (error) {
    console.error('[AI_INSIGHT_GET_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch insight' });
  }
});

export default router;
