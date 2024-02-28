'use strict'
require('dotenv').config()

module.exports = {
  useGPU: process.env.USE_GPU === 'true',
  whisperModel: process.env.WHISPER_MODEL || 'medium',
  whisperLocalModelPath: process.env.WHISPER_LOCAL_MODEL_PATH,
  transcriptionLanguage: process.env.TRANSCRIPTION_LANGUAGE || 'auto',
  slack: {
    token: process.env.SLACK_TOKEN,
    channelID: process.env.SLACK_CHANNEL_ID
  }
}
