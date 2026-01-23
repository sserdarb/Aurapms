
import { GoogleGenAI, Type } from "@google/genai";
import { Review, RoomType, Language } from '../types';

// Default Gemini API Key (can be overridden in settings)
const DEFAULT_API_KEY = 'AIzaSyDb9g1p9ioHbDDt_LNku_NQMzeg6z4zxB0';
let globalKey: string | null = null;

// Get API key - priority: global runtime set > localStorage > env > default
const getApiKey = (): string => {
    if (globalKey) return globalKey;
    if (typeof window !== 'undefined') {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) return storedKey;
    }
    return process.env.API_KEY || DEFAULT_API_KEY;
};

// Set global runtime key
export const setGlobalApiKey = (key: string | null) => {
    globalKey = key;
};

// Set custom API key
export const setApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('gemini_api_key', key);
    }
};

// Get current API key (masked for display)
export const getMaskedApiKey = (): string => {
    const key = getApiKey();
    if (!key || key.length < 10) return '••••••••••••';
    return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
};

// Check if using default key
export const isUsingDefaultKey = (): boolean => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    return !stored;
};

// Clear custom key to use default
export const resetToDefaultKey = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('gemini_api_key');
    }
};

// Initialize Gemini API
const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });
const apiKey = getApiKey();

export const analyzeReviews = async (reviews: Review[], language: Language): Promise<{ summary: string, sentimentBreakdown: string, suggestedAction: string }> => {
    if (!apiKey) {
        return {
            summary: "API Key not configured. Please add your Gemini API Key to the environment variables.",
            sentimentBreakdown: "N/A",
            suggestedAction: "Configure API Key to enable AI insights."
        };
    }

    // Prepare the input text
    const reviewsText = reviews.map(r => `- (${r.rating}/5) ${r.source}: "${r.content}"`).join('\n');
    const langName = language === 'tr' ? 'Turkish' : language === 'de' ? 'German' : language === 'ru' ? 'Russian' : 'English';

    const prompt = `
    You are an expert hotel manager. Analyze the following guest reviews.
    
    Reviews:
    ${reviewsText}

    Provide a JSON response in ${langName} language with the following fields:
    1. summary: A concise executive summary of the feedback (max 2 sentences).
    2. sentimentBreakdown: A brief string describing the balance of positive vs negative.
    3. suggestedAction: One concrete, high-impact action item for the hotel management.
  `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        sentimentBreakdown: { type: Type.STRING },
                        suggestedAction: { type: Type.STRING }
                    },
                    required: ["summary", "sentimentBreakdown", "suggestedAction"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text);

    } catch (error) {
        console.error("Error analyzing reviews:", error);
        return {
            summary: "Unable to analyze reviews at this time.",
            sentimentBreakdown: "Unknown",
            suggestedAction: "Check network connection or try again later."
        };
    }
};

export const generateReviewResponse = async (review: Review, language: Language): Promise<string> => {
    if (!apiKey) return "Thank you for your feedback.";
    const langName = language === 'tr' ? 'Turkish' : language === 'de' ? 'German' : language === 'ru' ? 'Russian' : 'English';

    const prompt = `
      Write a polite, professional, and warm response to this boutique hotel review in ${langName}. 
      The response should be personalized and address the specific points mentioned.
      
      Reviewer: ${review.author}
      Rating: ${review.rating}/5
      Content: "${review.content}"
      
      Keep it under 60 words.
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Thank you for your feedback.";
    } catch (e) {
        console.error("Error generating response:", e);
        return "Thank you for staying with us.";
    }
};

export interface PricingStrategy {
    suggestedAction: 'raise' | 'lower' | 'hold';
    percentage: number;
    reasoning: string;
}

export const generatePricingStrategy = async (
    roomType: RoomType,
    currentPrice: number,
    occupancyRate: number,
    competitorAvg: number,
    language: Language
): Promise<PricingStrategy> => {
    if (!apiKey) return { suggestedAction: 'hold', percentage: 0, reasoning: "AI Config Missing" };
    const langName = language === 'tr' ? 'Turkish' : language === 'de' ? 'German' : language === 'ru' ? 'Russian' : 'English';

    const prompt = `
        Act as a Revenue Manager for a boutique hotel. 
        Context:
        - Room Type: ${roomType}
        - Current Price: ${currentPrice}
        - Current Occupancy for next 7 days: ${occupancyRate}%
        - Competitor Average Price: ${competitorAvg}

        Determine the best pricing strategy.
        - If occupancy is high (>80%) or price is significantly lower than competitors, suggest raising.
        - If occupancy is low (<40%) and price is higher than competitors, suggest lowering.
        - Otherwise hold.

        Return JSON. The 'reasoning' field must be in ${langName} language.
        { suggestedAction: 'raise'|'lower'|'hold', percentage: number (e.g. 10 for 10%), reasoning: string (max 15 words) }
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedAction: { type: Type.STRING, enum: ['raise', 'lower', 'hold'] },
                        percentage: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["suggestedAction", "percentage", "reasoning"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating pricing strategy:", error);
        return { suggestedAction: 'hold', percentage: 0, reasoning: "AI Service Error" };
    }
};

export interface ReportingInsights {
    revenueTrendAnalysis: string;
    occupancyForecast: string;
    strategicAdvice: string;
    marketAnalysis: string;
}

export const generateReportingInsights = async (
    data: any[], // simplified trend data
    metrics: any, // total revenue, occupancy rate etc
    language: Language
): Promise<ReportingInsights> => {
    if (!apiKey) return {
        revenueTrendAnalysis: "AI Service Unavailable",
        occupancyForecast: "AI Service Unavailable",
        strategicAdvice: "Please check API key configuration.",
        marketAnalysis: "Market data unavailable."
    };

    const langName = language === 'tr' ? 'Turkish' : language === 'de' ? 'German' : language === 'ru' ? 'Russian' : 'English';

    const prompt = `
        Act as a Hotel Revenue Manager. Analyze the following performance metrics for the last 7 days.
        
        Metrics:
        - Total Revenue: ${metrics.totalRev}
        - Occupancy Rate: ${metrics.occupancyRate}%
        - ADR: ${metrics.avgDailyRate}
        
        Daily Trend Data (last 7 days):
        ${JSON.stringify(data)}

        Provide a JSON response in ${langName} with:
        1. revenueTrendAnalysis: Analysis of the revenue trend (rising, falling, stable) and key drivers.
        2. occupancyForecast: A prediction for the next week based on the current momentum.
        3. strategicAdvice: One or two actionable tips to improve performance.
        4. marketAnalysis: A brief analysis of competitor pricing trends and inferred demand based on the occupancy/ADR balance.
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        revenueTrendAnalysis: { type: Type.STRING },
                        occupancyForecast: { type: Type.STRING },
                        strategicAdvice: { type: Type.STRING },
                        marketAnalysis: { type: Type.STRING }
                    },
                    required: ["revenueTrendAnalysis", "occupancyForecast", "strategicAdvice", "marketAnalysis"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating reporting insights:", error);
        return {
            revenueTrendAnalysis: "Unable to generate analysis.",
            occupancyForecast: "Unable to generate forecast.",
            strategicAdvice: "Please try again later.",
            marketAnalysis: "N/A"
        };
    }
};
