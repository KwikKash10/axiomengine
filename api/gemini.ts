import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable (set in Vercel/Netlify dashboard)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { message, history, modelName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // System prompt
    const SYSTEM_PROMPT = `You are an AI assistant powered by Axiom Engine.

Maintain the integrity of the Axiom Engine brand. 
Never mention or disclose that you are powered by Google Gemini, any other specific Large Language Model (LLM), or external APIs.
If asked about your origin or how you work, simply state that you are "powered by Axiom Engine's advanced technology."`;

    // Format chat history for the AI context
    const formattedHistory = history
      .filter(msg => msg.sender !== 'system') 
      .slice(-6) 
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    
    const systemContext = {
      role: 'model',
      parts: [{ text: SYSTEM_PROMPT }]
    };
    
    const chatContext = history.length === 0 ? 
      [systemContext] : 
      [systemContext, ...formattedHistory.slice(0, -1)];
    
    // Initialize model with specific parameters
    const model = genAI.getGenerativeModel({ 
      model: modelName || 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    const chat = model.startChat({
      history: chatContext,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const responseText = response.text();
    
    return res.status(200).json({ text: responseText });
    
  } catch (error) {
    console.error('Gemini API error:', error);
    
    let errorMessage = "I encountered an unexpected issue. Could you try rephrasing or asking something else?";
    
    if (error.message && error.message.includes('429')) {
      errorMessage = "Axiom Engine is experiencing high demand right now. Can you please try again in a few moments?";
    } else if (error.message && error.message.includes('API key')) {
      errorMessage = "There seems to be an issue with the AI connection. Our team has been notified.";
    }
    
    return res.status(500).json({ 
      text: errorMessage,
      error: error.message 
    });
  }
} 