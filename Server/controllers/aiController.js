import { GoogleGenerativeAI } from '@google/generative-ai';


// ─── Helper — initialized fresh each call so env vars are loaded ─────────────
const ask = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// @desc    Generate lease agreement
// @route   POST /api/ai/lease
// @access  Private
export const generateLease = async (req, res) => {
  try {
    const { property, tenant, rent, terms } = req.body;
    if (!property || !tenant || !rent) {
      return res.status(400).json({ status: 'error', message: 'Property, tenant and rent are required' });
    }

    const prompt = `You are a professional real estate lawyer. Generate a complete, professional residential lease agreement with the following details:

Property: ${property}
Tenant Name: ${tenant}
Monthly Rent: $${rent}
Additional Terms: ${terms || 'Standard residential terms apply'}

Include all standard sections: parties involved, property description, lease term, rent payment details, security deposit, utilities, maintenance responsibilities, entry rights, termination conditions, and signatures section.

Format it cleanly and professionally. Make it legally sound but easy to read.`;

    const text = await ask(prompt);
    res.status(200).json({ status: 'success', data: { text } });
  } catch (error) {
    console.error('Lease generation error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to generate lease. Check your Gemini API key.' });
  }
};

// @desc    Get market insights
// @route   POST /api/ai/market
// @access  Private
export const getMarketInsights = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ status: 'error', message: 'Location is required' });
    }

    const prompt = `You are a real estate market analyst. Provide a detailed rental market analysis for: ${location}

Include:
1. Average rent ranges by property type (studio, 1bed, 2bed, 3bed)
2. Current market demand level (Low/Medium/High)
3. Average occupancy rates
4. Top 5 amenities tenants are looking for in this area
5. Pricing recommendations for landlords
6. Market trend (rising/stable/declining) with brief explanation
7. Best months to list properties

Format with clear sections and bullet points. Be specific with numbers where possible.`;

    const text = await ask(prompt);
    res.status(200).json({ status: 'success', data: { text } });
  } catch (error) {
    console.error('Market insights error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch market insights.' });
  }
};

// @desc    Custom AI prompt
// @route   POST /api/ai/ask
// @access  Private
export const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ status: 'error', message: 'Please enter a valid question' });
    }

    const prompt = `You are RentMaster AI, an expert assistant for property managers, landlords, and real estate professionals. 
    
Answer the following question clearly and helpfully. Focus on practical, actionable advice related to property management, rental laws, tenant relations, maintenance, and real estate:

${question}

Keep your response well-structured and easy to read. Use bullet points or numbered lists where appropriate.`;

    const text = await ask(prompt);
    res.status(200).json({ status: 'success', data: { text } });
  } catch (error) {
    console.error('AI ask error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to get AI response.' });
  }
};