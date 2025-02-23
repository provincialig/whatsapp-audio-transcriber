# whatsapp-audio-transcriber

A Node.js WhatsApp Bot to automatically transcribe voice messages using whisper.cpp and send it on Slack.

## Overview

This project uses:

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js): A WhatsApp API client that connects through the WhatsApp Web browser app using [Puppeteer](https://github.com/puppeteer/puppeteer).

- [smart-whisper](https://github.com/JacobLinCool/smart-whisper): A Node.js wrapper for [whisper.cpp](https://github.com/ggerganov/whisper.cpp).

## Usage

1. Download and install [FFmpeg](https://www.ffmpeg.org/).

2. Clone this repository, install dependencies and build the application `git clone https://github.com/provincialig/whatsapp-audio-transcriber.git && cd whatsapp-audio-transcriber && npm install`.

3. Download the OpenAI's Whisper model converted to ggml format from [here](https://huggingface.co/ggerganov/whisper.cpp).

4. Rename the `.env.example` file to `.env` and edit it with your configuration (make sure to edit the `WHISPER_LOCAL_MODEL_PATH` parameter with the path of the downloaded Whisper model).

5. Start the application: `npm start`.

6. Scan the QR code using the WhatsApp mobile app to authenticate.

7. Test the application by sending a voice message and check the transcribed text.