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

// POST /api/ai/snoop - Snoop Dogg analysis with TTS
router.post('/snoop', upload.single('image'), async (req, res) => {
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
      console.log('Weather data retrieved for Snoop analysis:', weatherData);
    } catch (weatherError) {
      console.error('Failed to get weather data for Snoop analysis:', weatherError);
      // Continue without weather data
    }

    // Use prompt service for Snoop analysis
    const PromptService = require('../services/promptService');
    const snoopPrompt = PromptService.generateSnoopPrompt(weatherData);

    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, snoopPrompt, 'snoop-analysis');
    
    // Generate TTS audio with onyx voice for Snoop Dogg personality
    let audioBuffer = null;
    
    try {
      const TTSService = require('../services/ttsService');
      const ttsService = new TTSService();
      const ttsResult = await ttsService.generateSpeech(analysis, 'onyx', 'snoop');
      audioBuffer = ttsResult.audioBuffer;
    } catch (ttsError) {
      console.error('TTS generation failed for Snoop:', ttsError);
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        audio: audioBuffer.toString('base64'),
        voice: 'onyx',
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
    console.error('Snoop Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform Snoop analysis',
      message: error.message 
    });
  }
});

// POST /api/ai/magic-mirror-tts - Magic Mirror analysis with TTS
router.post('/magic-mirror-tts', upload.single('image'), async (req, res) => {
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
      console.log('Weather data retrieved for Magic Mirror TTS analysis:', weatherData);
    } catch (weatherError) {
      console.error('Failed to get weather data for Magic Mirror TTS analysis:', weatherError);
      // Continue without weather data
    }

    // Use prompt service for Magic Mirror analysis
    const PromptService = require('../services/promptService');
    const magicMirrorPrompt = PromptService.generateMagicMirrorPrompt(weatherData);

    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, magicMirrorPrompt, 'magic-mirror-analysis');
    
    // Generate TTS audio with fable voice for Magic Mirror personality
    let audioBuffer = null;
    
    try {
      const TTSService = require('../services/ttsService');
      const ttsService = new TTSService();
      const ttsResult = await ttsService.generateSpeech(analysis, 'fable', 'magic-mirror');
      audioBuffer = ttsResult.audioBuffer;
    } catch (ttsError) {
      console.error('TTS generation failed for Magic Mirror:', ttsError);
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        audio: audioBuffer.toString('base64'),
        voice: 'fable',
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
    console.error('Magic Mirror TTS Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform Magic Mirror TTS analysis',
      message: error.message 
    });
  }
});

// POST /api/ai/automatic - Automatic analysis for motion detection
router.post('/automatic', upload.single('image'), async (req, res) => {
  console.log('=== AUTOMATIC ROUTE CALLED ===');
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('File received:', req.file ? 'YES' : 'NO');
  if (req.file) {
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);
  }
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;
    
    // DEBUG: Save image to see what we're actually sending
    const fs = require('fs');
    const path = require('path');
    const debugDir = path.join(__dirname, '../debug-images');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const debugPath = path.join(debugDir, `debug-${timestamp}.jpg`);
    fs.writeFileSync(debugPath, imageBuffer);
    console.log('DEBUG: Saved image to:', debugPath);

    // Get weather data
    let weatherData = null;
    try {
      const WeatherService = require('../services/weatherService');
      const weatherService = new WeatherService();
      weatherData = await weatherService.getWeatherData();
      console.log('Weather data retrieved for automatic analysis:', weatherData);
    } catch (weatherError) {
      console.error('Failed to get weather data for automatic analysis:', weatherError);
      // Continue without weather data
    }

    // Use prompt service for automatic analysis
    const PromptService = require('../services/promptService');
    
    // Get personality from request body, or use random if not provided
    const requestedPersonality = req.body.personality;
    let personalityResult;
    
    if (requestedPersonality) {
      console.log(`Using requested personality: ${requestedPersonality}`);
      // Generate prompt for the specific personality
      switch (requestedPersonality) {
        case 'Magic Mirror':
          personalityResult = {
            prompt: PromptService.generateMagicMirrorPrompt(weatherData),
            personality: 'Magic Mirror',
            voice: 'fable'
          };
          break;
        case 'Snoop Dogg':
          personalityResult = {
            prompt: PromptService.generateSnoopDoggPrompt(weatherData),
            personality: 'Snoop Dogg',
            voice: 'ash'
          };
          break;
        case 'Apathetic':
          personalityResult = {
            prompt: PromptService.generateApatheticPrompt(weatherData),
            personality: 'Apathetic',
            voice: 'alloy'
          };
          break;
        default:
          console.log(`Unknown personality "${requestedPersonality}", using random`);
          personalityResult = PromptService.generateRandomPersonalityPrompt(weatherData);
      }
    } else {
      console.log('No personality requested, using random');
      personalityResult = PromptService.generateRandomPersonalityPrompt(weatherData);
    }
    
    const automaticPrompt = personalityResult.prompt;
    const selectedVoice = personalityResult.voice;
    
    console.log('=== AUTOMATIC ANALYSIS DEBUG ===');
    console.log('Generated prompt:', automaticPrompt);
    console.log('Selected voice:', selectedVoice);
    console.log('Weather data:', weatherData);

    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, automaticPrompt, 'automatic-analysis');
    
    // Generate TTS audio for automatic responses
    let audioBuffer = null;
    
    try {
      const TTSService = require('../services/ttsService');
      const ttsService = new TTSService();
      const ttsResult = await ttsService.generateSpeech(analysis, selectedVoice, 'automatic');
      audioBuffer = ttsResult.audioBuffer;
    } catch (ttsError) {
      console.error('TTS generation failed for automatic analysis:', ttsError);
    }

    // Return both text and audio
    if (audioBuffer) {
      res.json({ 
        analysis,
        audio: audioBuffer.toString('base64'),
        voice: selectedVoice,
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
    console.error('Automatic Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform automatic analysis',
      message: error.message 
    });
  }
});

// POST /api/ai/magic-mirror - Magic Mirror text-only analysis
router.post('/magic-mirror', upload.single('image'), async (req, res) => {
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
      console.log('Weather data retrieved for Magic Mirror analysis:', weatherData);
    } catch (weatherError) {
      console.error('Failed to get weather data for Magic Mirror analysis:', weatherError);
      // Continue without weather data
    }

    // Use prompt service for Magic Mirror analysis
    const PromptService = require('../services/promptService');
    const magicMirrorPrompt = PromptService.generateMagicMirrorPrompt(weatherData);

    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, magicMirrorPrompt, 'magic-mirror-analysis');
    
    // Return text-only response (no TTS for speed)
    res.json({ 
      analysis,
      weather: weatherData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Magic Mirror Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform Magic Mirror analysis',
      message: error.message 
    });
  }
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

    const analysis = await OpenAIService.analyzeImage(imageBuffer, imageType, outfitPrompt, 'outfit-analysis');
    
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
