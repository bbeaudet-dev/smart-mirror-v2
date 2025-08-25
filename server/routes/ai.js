const express = require('express');
const multer = require('multer');
const OpenAIService = require('../services/openai');
const RoboflowService = require('../services/roboflowService');

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



// POST /api/ai/analyze-outfit-with-weather - Outfit analysis with weather context
router.post('/analyze-outfit-with-weather', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;

    // Get weather data
    let weatherData = null;
    try {
      const WeatherService = require('../services/weatherService');
      const weatherService = new WeatherService();
      weatherData = await weatherService.getWeatherData();
      console.log('Weather data retrieved for outfit analysis:', weatherData);
    } catch (weatherError) {
      console.error('Failed to get weather data for outfit analysis:', weatherError);
      // Continue without weather data
    }

    // Use prompt service for weather-aware outfit analysis
    const PromptService = require('../services/promptService');
    const outfitPrompt = PromptService.generateWeatherAwareOutfitPrompt(weatherData);

    // Start both AI analysis and TTS generation in parallel
    const voice = req.body.voice || 'nova';
    
    const [analysis, ttsResult] = await Promise.allSettled([
      OpenAIService.analyzeImage(imageBuffer, imageType, outfitPrompt, 'outfit-analysis'),
      (async () => {
        try {
          const TTSService = require('../services/ttsService');
          const ttsService = new TTSService();
          // We'll generate TTS after we get the analysis text
          return { voice };
        } catch (error) {
          console.error('TTS service initialization failed:', error);
          return null;
        }
      })()
    ]);

    // Handle AI analysis result
    if (analysis.status === 'rejected') {
      throw new Error(`AI analysis failed: ${analysis.reason.message}`);
    }
    
    const analysisText = analysis.value;
    
    // Generate TTS for the analysis text
    let audioBuffer = null;
    if (ttsResult.status === 'fulfilled' && ttsResult.value) {
      try {
        const TTSService = require('../services/ttsService');
        const ttsService = new TTSService();
        const ttsResponse = await ttsService.generateSpeech(analysisText, voice, 'default');
        audioBuffer = ttsResponse.audioBuffer;
      } catch (ttsError) {
        console.error('TTS generation failed, returning text only:', ttsError);
      }
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        audio: audioBuffer.toString('base64'),
        voice,
        weather: weatherData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({ 
        analysis,
        weather: weatherData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Weather-Aware Outfit Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze outfit with weather',
      message: error.message 
    });
  }
});

// POST /api/ai/analyze-outfit - Basic outfit analysis
router.post('/analyze-outfit', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;

    // Use prompt service for basic outfit analysis
    const PromptService = require('../services/promptService');
    const prompt = PromptService.generateOutfitAnalysisPrompt();
    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, prompt, 'outfit-analysis');
    
    // Generate TTS audio in parallel with selected voice
    let audioBuffer = null;
    let voice = req.body.voice || 'nova';
    
    try {
      const TTSService = require('../services/ttsService');
      const ttsService = new TTSService();
      const ttsResult = await ttsService.generateSpeech(analysis, voice, 'default');
      audioBuffer = ttsResult.audioBuffer;
      voice = ttsResult.voice;
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

// POST /api/ai/analyze-outfit-enhanced - Enhanced outfit analysis with Roboflow + OpenAI
router.post('/analyze-outfit-enhanced', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;
    const imageBase64 = imageBuffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

    // Step 1: Detect clothing items using Roboflow
    const roboflowService = new RoboflowService();
    const detections = await roboflowService.detectClothing(imageBuffer);

    // Step 2: Get weather data
    let weatherData = null;
    try {
      const WeatherService = require('../services/weatherService');
      const weatherService = new WeatherService();
      weatherData = await weatherService.getWeatherData();
    } catch (weatherError) {
      console.error('Failed to get weather data for enhanced analysis:', weatherError);
    }

    // Step 3: Generate enhanced prompt with detected items
    const enhancedPrompt = roboflowService.generateEnhancedPrompt(detections, weatherData);

    // Step 4: Send to OpenAI with enhanced prompt
    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, enhancedPrompt, 'outfit-analysis');

    res.json({ 
      analysis,
      detections,
      enhancedPrompt,
      weather: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Enhanced Outfit Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform enhanced outfit analysis',
      message: error.message 
    });
  }
});

module.exports = router;
