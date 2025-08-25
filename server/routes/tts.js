const express = require('express');
const ElevenLabsService = require('../services/elevenLabsService');

const router = express.Router();
const elevenLabsService = new ElevenLabsService();

/**
 * Generate speech from text using ElevenLabs
 * POST /api/tts/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { text, voice = 'nova' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`ElevenLabs TTS request: "${text.substring(0, 50)}..." with voice: ${voice}`);

    // Generate audio using ElevenLabs
    const audioStream = await elevenLabsService.streamAudio(text, voice);
    
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
    
    const audioBuffer = Buffer.concat(chunks);
    console.log(`Generated audio buffer: ${audioBuffer.length} bytes`);

    // Set response headers for audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'X-Voice': voice,
      'Accept-Ranges': 'bytes'
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('ElevenLabs TTS generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get available ElevenLabs voices
 * GET /api/tts/voices
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = await elevenLabsService.getVoices();
    // Extract just the voice names for the frontend
    const voiceNames = voices ? voices.map(voice => voice.name?.toLowerCase() || voice.voice_id) : [];
    res.json({ voices: voiceNames });
  } catch (error) {
    console.error('Error getting ElevenLabs voices:', error);
    // Fallback to basic voices if ElevenLabs fails
    res.json({ 
      voices: ['nova', 'rachel', 'clyde', 'roger', 'sarah', 'laura', 'thomas', 'charlie', 'george', 'callum', 'river', 'harry', 'liam', 'alice', 'matilda', 'will', 'jessica', 'eric', 'chris', 'brian', 'daniel', 'lily', 'bill']
    });
  }
});

/**
 * Clear audio cache (placeholder for ElevenLabs)
 * DELETE /api/tts/cache
 */
router.delete('/cache', (req, res) => {
  try {
    // ElevenLabs doesn't have local caching, but we can clear any server-side cache if needed
    res.json({ message: 'Audio cache cleared (ElevenLabs uses cloud processing)' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
