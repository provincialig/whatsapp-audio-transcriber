'use strict'
const fs = require('fs')

const qrcode = require('qrcode-terminal')
const ffmpeg = require('fluent-ffmpeg')
const { decode } = require('node-wav')

const { Client, LocalAuth } = require('whatsapp-web.js')
const { Whisper, manager } = require('smart-whisper')
const { WebClient } = require('@slack/web-api')

const configuration = require('./configuration')

const main = async () => {
  let whisperFile
  if (fs.existsSync(configuration.whisperLocalModelPath)) {
    whisperFile = configuration.whisperLocalModelPath
  } else {
    if (!manager.check(configuration.whisperModel)) {
      await manager.download(configuration.whisperModel)
    }
    whisperFile = manager.resolve(configuration.whisperModel)
  }

  const whisper = new Whisper(whisperFile, { gpu: configuration.useGPU })
  const client = new Client({ authStrategy: new LocalAuth() })
  const slack = new WebClient(configuration.slack.token)

  client.on('qr', async (qr) => {
    const clientState = await client.getState()
    if (clientState !== 'CONNECTED') {
      qrcode.generate(qr, { small: true })
    }
  })

  client.on('ready', () => {
    console.log('✅ Listening for message.\n')
  })

  client.on('message', async (message) => {
    if (message.type === 'ptt') {
      const author = message._data.notifyName
      const time = new Date(message.timestamp * 1000).toLocaleString()

      const filePathWithoutExtension = `./tmp/audio/${Date.now()}`

      console.log(`🔈 New message from: ${author} - ${time}`)

      const audio = await message.downloadMedia()
      fs.writeFileSync(`${filePathWithoutExtension}.ogg`, audio.data, 'base64')

      ffmpeg(`${filePathWithoutExtension}.ogg`)
        .audioFrequency(16000)
        .toFormat('wav')
        .save(`${filePathWithoutExtension}.wav`)
        .on('end', async () => {
          const { channelData } = decode(fs.readFileSync(`${filePathWithoutExtension}.wav`))
          const pcm = channelData[0]

          fs.unlinkSync(`${filePathWithoutExtension}.ogg`)
          fs.unlinkSync(`${filePathWithoutExtension}.wav`)

          const task = await whisper.transcribe(pcm, { language: configuration.transcriptionLanguage })
          const transcription = (await task.result).map((result) => result.text).join(' ')
          if (transcription) {
            try {
              await slack.chat.postMessage({
                channel: configuration.slack.channelID,
                text: `[${author}] ${transcription}`,
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `:bust_in_silhouette: *${author}* :alarm_clock: *${time}*\n${transcription}`
                    }
                  }
                ]
              })

              console.log('📤 Message sent on Slack')
            } catch (e) {
              console.error(`❌ Can't send message on Slack: ${e.message}`)
            }
          }
        })
    }
  })

  console.log('⏳ Starting App...')
  fs.mkdirSync('./tmp/audio', { recursive: true })
  client.initialize()
}

main()
