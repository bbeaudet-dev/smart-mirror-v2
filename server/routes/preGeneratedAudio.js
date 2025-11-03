const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const preGeneratedAudioService = require('../services/preGeneratedAudioService');

const router = express.Router();

/**
 * GET /api/pre-generated-audio/status
 * Check the status of pre-generated audio files
 */
router.get('/status', async (req, res) => {
  try {
    const status = await preGeneratedAudioService.checkAudioFiles();
    res.json({
      success: true,
      status,
      responses: preGeneratedAudioService.getAllResponses()
    });
  } catch (error) {
    console.error('Error checking pre-generated audio status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check audio status'
    });
  }
});

/**
 * GET /api/pre-generated-audio/responses
 * Get all available response messages
 */
router.get('/responses', async (req, res) => {
  try {
    res.json({
      success: true,
      responses: preGeneratedAudioService.getAllResponses()
    });
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get responses'
    });
  }
});

/**
 * POST /api/pre-generated-audio/generate
 * Generate all pre-generated audio files
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('🎵 Starting pre-generated audio generation...');
    await preGeneratedAudioService.generateAllAudio();
    
    const status = await preGeneratedAudioService.checkAudioFiles();
    res.json({
      success: true,
      message: 'Pre-generated audio files created successfully',
      status
    });
  } catch (error) {
    console.error('Error generating pre-generated audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio files',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/motion
 * Get a random motion response audio file
 * If ?format=json, returns JSON with base64 audio and text
 */
router.get('/motion', async (req, res) => {
  try {
    // Randomly select from available voices
    const availableVoices = ['ash'];
    const voice = req.query.voice || availableVoices[Math.floor(Math.random() * availableVoices.length)];
    const audioInfo = await preGeneratedAudioService.getRandomMotionAudio(voice);
    
    // If format=json, return JSON with base64 audio and text
    if (req.query.format === 'json') {
      const audioBuffer = await fs.readFile(audioInfo.filepath);
      res.json({
        success: true,
        text: audioInfo.text,
        audio: audioBuffer.toString('base64'),
        voice: voice,
        type: audioInfo.type,
        timestamp: new Date().toISOString()
      });
    } else {
      // Send the audio file (backward compatible)
      res.sendFile(audioInfo.filepath, (err) => {
        if (err) {
          console.error('Error sending motion audio file:', err);
          res.status(500).json({
            success: false,
            error: 'Failed to send audio file'
          });
        }
      });
    }
  } catch (error) {
    console.error('Error getting motion audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get motion audio',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/welcome
 * Get a random welcome response audio file
 * If ?format=json, returns JSON with base64 audio and text
 */
router.get('/welcome', async (req, res) => {
  try {
    // Randomly select from available voices
    const availableVoices = ['ash'];
    const voice = req.query.voice || availableVoices[Math.floor(Math.random() * availableVoices.length)];
    const audioInfo = await preGeneratedAudioService.getRandomWelcomeAudio(voice);
    
    // If format=json, return JSON with base64 audio and text (like AI endpoint)
    if (req.query.format === 'json') {
      const audioBuffer = await fs.readFile(audioInfo.filepath);
      res.json({
        success: true,
        text: audioInfo.text,
        audio: audioBuffer.toString('base64'),
        voice: voice,
        type: audioInfo.type,
        timestamp: new Date().toISOString()
      });
    } else {
      // Send the audio file (backward compatible)
      res.sendFile(audioInfo.filepath, (err) => {
        if (err) {
          console.error('Error sending welcome audio file:', err);
          res.status(500).json({
            success: false,
            error: 'Failed to send audio file'
          });
        }
      });
    }
  } catch (error) {
    console.error('Error getting welcome audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get welcome audio',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/motion-text
 * Get a random motion response text (for display)
 */
router.get('/motion-text', async (req, res) => {
  try {
    const audioInfo = await preGeneratedAudioService.getRandomMotionAudio();
    res.json({
      success: true,
      text: audioInfo.text,
      type: audioInfo.type
    });
  } catch (error) {
    console.error('Error getting motion text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get motion text',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/welcome-text
 * Get a random welcome response text (for display)
 */
router.get('/welcome-text', async (req, res) => {
  try {
    const audioInfo = await preGeneratedAudioService.getRandomWelcomeAudio();
    res.json({
      success: true,
      text: audioInfo.text,
      type: audioInfo.type
    });
  } catch (error) {
    console.error('Error getting welcome text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get welcome text',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/sendoff
 * Get a random sendoff response audio file
 * If ?format=json, returns JSON with base64 audio and text
 */
router.get('/sendoff', async (req, res) => {
  try {
    // Randomly select from available voices
    const availableVoices = ['ash'];
    const voice = req.query.voice || availableVoices[Math.floor(Math.random() * availableVoices.length)];
    const audioInfo = await preGeneratedAudioService.getRandomSendoffAudio(voice);
    
    // If format=json, return JSON with base64 audio and text (like AI endpoint)
    if (req.query.format === 'json') {
      const audioBuffer = await fs.readFile(audioInfo.filepath);
      res.json({
        success: true,
        text: audioInfo.text,
        audio: audioBuffer.toString('base64'),
        voice: voice,
        type: audioInfo.type,
        timestamp: new Date().toISOString()
      });
    } else {
      // Send the audio file (backward compatible)
      res.sendFile(audioInfo.filepath, (err) => {
        if (err) {
          console.error('Error sending sendoff audio file:', err);
          res.status(500).json({
            success: false,
            error: 'Failed to send audio file'
          });
        }
      });
    }
  } catch (error) {
    console.error('Error getting sendoff audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sendoff audio',
      details: error.message
    });
  }
});

/**
 * GET /api/pre-generated-audio/sendoff-text
 * Get a random sendoff response text (for display)
 */
router.get('/sendoff-text', async (req, res) => {
  try {
    const audioInfo = await preGeneratedAudioService.getRandomSendoffAudio();
    res.json({
      success: true,
      text: audioInfo.text,
      type: audioInfo.type
    });
  } catch (error) {
    console.error('Error getting sendoff text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sendoff text',
      details: error.message
    });
  }
});

module.exports = router;
