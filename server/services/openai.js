const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Smart mirror personality and context
const SMART_MIRROR_CONTEXT = {
  'smart-mirror': `You are a helpful smart mirror assistant. Keep responses under 25 words. No emojis.`,
  'motivation': `You are a motivational coach. Keep responses under 25 words. No emojis.`,
  'outfit-analysis': `You are a casual fashion advisor. Keep responses under 25 words. No emojis. Be direct and encouraging.`,
  'outfit-recommendation': `You are a casual fashion advisor. Keep responses under 25 words. No emojis.`
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
        model: "gpt-4",
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
      const systemPrompt = SMART_MIRROR_CONTEXT[context] || SMART_MIRROR_CONTEXT['outfit-analysis'];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
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
        max_tokens: 50,
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI Vision Error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  /**
   * Analyze an image using OpenAI Vision API with streaming
   * @param {Buffer} imageBuffer - The image buffer
   * @param {string} imageType - The MIME type of the image
   * @param {string} prompt - The analysis prompt
   * @param {string} context - The context for the analysis
   * @returns {Promise<AsyncIterable>} - Streaming response
   */
  static async analyzeImageStream(imageBuffer, imageType, prompt, context = 'outfit-analysis') {
    try {
      const systemPrompt = SMART_MIRROR_CONTEXT[context] || SMART_MIRROR_CONTEXT['outfit-analysis'];
      
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
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
        max_tokens: 50,
        temperature: 0.7,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error('OpenAI Vision Streaming Error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  /**
   * Generate a motivational message
   * @param {string} timeOfDay - 'morning' or 'evening'
   * @param {string} mood - User's current mood
   * @returns {Promise<string>} - The motivational message
   */
  static async generateMotivation(timeOfDay = 'morning', mood = 'neutral') {
    const prompt = `Create a brief, uplifting ${timeOfDay} motivation message. Consider the user's mood (${mood}) and make it feel personal and encouraging. This is for someone using a smart mirror.`;
    
    return this.chat(prompt, 'motivation');
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
