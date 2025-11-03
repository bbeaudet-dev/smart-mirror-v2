const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Smart mirror personality and context
const SMART_MIRROR_CONTEXT = {
  'smart-mirror': `You are an enthusiastic and helpful smart mirror assistant responsible for gassing people up and complimenting them on their outfits. Keep responses under 50 words. No emojis.`
};

class OpenAIService {
  /**
   * Send a chat message to OpenAI
   * @param {string} message - The user's message
   * @param {string} context - The context/personality to use
   * @returns {Promise<string>} - The AI response
   */
  static async chat(message, context = 'smart-mirror') {
    try {
      const systemPrompt = SMART_MIRROR_CONTEXT[context] || SMART_MIRROR_CONTEXT['smart-mirror'];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Back to regular for better responses
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  /**
   * Analyze an image using OpenAI Vision API
   * @param {Buffer} imageBuffer - The image buffer
   * @param {string} imageType - The MIME type of the image
   * @param {string} prompt - The analysis prompt
   * @param {string} context - The context for the analysis
   * @returns {Promise<string>} - The analysis result
   */
  static async analyzeImage(imageBuffer, imageType, prompt, context = 'outfit-analysis') {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageType};base64,${imageBuffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content.trim();
      console.log('AI Response:', response);
      console.log('=== END DEBUG ===');
      
      return response;
    } catch (error) {
      console.error('OpenAI Vision Error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  /**
   * Check if OpenAI API key is configured
   * @returns {boolean} - True if API key is available
   */
  static isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }
}

module.exports = OpenAIService;
