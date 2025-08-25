const express = require('express');
const multer = require('multer');
const OpenAIService = require('../services/openai');
const RoboflowService = require('../services/roboflowService');
const ElevenLabsService = require('../services/elevenLabsService');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/ai/text-to-speech - Simple ElevenLabs TTS endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'nova' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const elevenLabs = new ElevenLabsService();
    
    // Generate audio using ElevenLabs
    const audioStream = await elevenLabs.streamAudio(text, voice);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    
    res.json({
      success: true,
      audio: audioBuffer.toString('base64'),
      voice,
      textLength: text.length
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      message: error.message 
    });
  }
});

// GET /api/ai/elevenlabs-test - Test ElevenLabs connection
router.get('/elevenlabs-test', async (req, res) => {
  try {
    const elevenLabs = new ElevenLabsService();
    
    console.log('Testing ElevenLabs connection...');
    console.log('API Key present:', !!process.env.ELEVENLABS_API_KEY);
    
    const isConnected = await elevenLabs.testConnection();
    const voices = await elevenLabs.getVoices();
    
    res.json({ 
      connected: isConnected, 
      voices: voices && voices.length ? voices.slice(0, 10) : [], // First 10 voices
      message: isConnected ? 'ElevenLabs connected!' : 'ElevenLabs connection failed - check server logs',
      apiKeyPresent: !!process.env.ELEVENLABS_API_KEY
    });
  } catch (error) {
    console.error('ElevenLabs test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/analyze-outfit - Basic outfit analysis with ElevenLabs TTS
router.post('/analyze-outfit', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;
    const voice = req.query.voice || req.body.voice || 'nova';
    console.log('Basic AI route received voice parameter:', voice);
    console.log('Basic Request body keys:', Object.keys(req.body));
    console.log('Basic Request body voice:', req.body.voice);
    console.log('Basic Request body:', req.body);
    console.log('Enhanced AI route received voice parameter:', voice);
    console.log('Enhanced Request body keys:', Object.keys(req.body));
    console.log('Enhanced Request body voice:', req.body.voice);

    // Use prompt service for basic outfit analysis
    const PromptService = require('../services/promptService');
    const prompt = PromptService.generateOutfitAnalysisPrompt();

    // Get AI analysis
    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, prompt, 'outfit-analysis');
    
    // Generate TTS for the analysis text using ElevenLabs
    let audioBuffer = null;
    try {
      const elevenLabs = new ElevenLabsService();
      const audioStream = await elevenLabs.streamAudio(analysis, voice);
      
      // Convert stream to buffer with better error handling
      const chunks = [];
      try {
        for await (const chunk of audioStream) {
          if (chunk && chunk.length > 0) {
            chunks.push(chunk);
          }
        }
      } catch (streamError) {
        console.error('Error reading audio stream:', streamError);
        throw new Error('Failed to read audio stream');
      }
      
      if (chunks.length === 0) {
        throw new Error('No audio data received from ElevenLabs');
      }
      
      audioBuffer = Buffer.concat(chunks);
      console.log(`Generated audio buffer: ${audioBuffer.length} bytes for voice: ${voice}`);
    } catch (ttsError) {
      console.error('TTS generation failed, returning text only:', ttsError);
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        audio: audioBuffer.toString('base64'),
        voice,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({ 
        analysis,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Outfit Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze outfit',
      message: error.message 
    });
  }
});

// POST /api/ai/detect-clothing - Standalone clothing detection using Roboflow
router.post('/detect-clothing', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

    const roboflowService = new RoboflowService();
    const detections = await roboflowService.detectClothing(imageData);

    res.json({ 
      detections,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clothing Detection Error:', error);
    res.status(500).json({ 
      error: 'Failed to detect clothing items',
      message: error.message 
    });
  }
});

// POST /api/ai/analyze-outfit-enhanced - Enhanced outfit analysis with Roboflow + OpenAI + ElevenLabs TTS
router.post('/analyze-outfit-enhanced', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;
    const imageBase64 = imageBuffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;
    const voice = req.query.voice || req.body.voice || 'nova';

    // Step 1: Detect clothing items using Roboflow
    const roboflowService = new RoboflowService();
    const detections = await roboflowService.detectClothing(imageBuffer);

    // Step 2: Get weather data (using cached singleton)
    let weatherData = null;
    try {
      const weatherService = require('../services/weatherService');
      weatherData = await weatherService.getWeatherData();
    } catch (weatherError) {
      console.error('Failed to get weather data for enhanced analysis:', weatherError);
    }

    // Step 3: Generate enhanced prompt with detected items
    const enhancedPrompt = roboflowService.generateEnhancedPrompt(detections, weatherData);

    // Step 4: Send to OpenAI with enhanced prompt
    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, enhancedPrompt, 'outfit-analysis');
    
    // Step 5: Generate TTS for the analysis text using ElevenLabs
    let audioBuffer = null;
    try {
      const elevenLabs = new ElevenLabsService();
      const audioStream = await elevenLabs.streamAudio(analysis, voice);
      
      // Convert stream to buffer with better error handling
      const chunks = [];
      try {
        for await (const chunk of audioStream) {
          if (chunk && chunk.length > 0) {
            chunks.push(chunk);
          }
        }
      } catch (streamError) {
        console.error('Error reading audio stream:', streamError);
        throw new Error('Failed to read audio stream');
      }
      
      if (chunks.length === 0) {
        throw new Error('No audio data received from ElevenLabs');
      }
      
      audioBuffer = Buffer.concat(chunks);
      console.log(`Generated audio buffer: ${audioBuffer.length} bytes for voice: ${voice}`);
    } catch (ttsError) {
      console.error('TTS generation failed, returning text only:', ttsError);
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        detections,
        enhancedPrompt,
        weather: weatherData,
        audio: audioBuffer.toString('base64'),
        voice,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({ 
        analysis,
        detections,
        enhancedPrompt,
        weather: weatherData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Enhanced Outfit Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform enhanced outfit analysis',
      message: error.message 
    });
  }
});

module.exports = router;
