const WebSocket = require('ws');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.DEEPGRAM_API_KEY;
const PORT = process.env.PORT || 3001;

if (!apiKey) {
  console.warn('\n⚠️  WARNING: DEEPGRAM_API_KEY is not defined in .env.local! The server will not be able to connect to Deepgram.\n');
}

const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 WebSocket Server listening on ws://localhost:${PORT}`);

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[Server] New browser client connected from ${clientIp}`);

  if (!apiKey) {
    console.error('[Server] Authentication failed: Deepgram API key missing.');
    ws.send(JSON.stringify({ type: 'error', message: 'API key configuration missing on server.' }));
    ws.close(1008, 'Deepgram API key missing');
    return;
  }

  // Connect to Deepgram Live Streaming API
  // Use nova-2 model, smart format, interim results, filler words, and 300ms endpointing
  const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&filler_words=true&endpointing=300';
  
  console.log('[Server] Connecting to Deepgram Live Stream API...');
  const deepgramWs = new WebSocket(deepgramUrl, {
    headers: {
      Authorization: `Token ${apiKey}`
    }
  });

  let deepgramOpen = false;

  deepgramWs.on('open', () => {
    console.log('[Server] Deepgram streaming connection established.');
    deepgramOpen = true;
    ws.send(JSON.stringify({ type: 'connected', message: 'Successfully connected to transcription service.' }));
  });

  deepgramWs.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString());
      const transcript = response.channel?.alternatives?.[0]?.transcript || '';
      const isFinal = response.is_final;

      // Send the text transcript if there is text or it marks a final segment
      if (transcript.trim() || isFinal) {
        console.log(`[Deepgram] [${isFinal ? 'FINAL' : 'INTERIM'}] "${transcript}"`);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: isFinal ? 'final' : 'interim',
            text: transcript
          }));
        }
      }
    } catch (err) {
      console.error('[Server] Error processing Deepgram message:', err);
    }
  });

  deepgramWs.on('close', (code, reason) => {
    console.log(`[Server] Deepgram connection closed: code=${code}, reason=${reason}`);
    deepgramOpen = false;
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Deepgram connection closed');
    }
  });

  deepgramWs.on('error', (err) => {
    console.error('[Server] Deepgram websocket error:', err.message);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'error', message: 'Speech recognition service error.' }));
    }
  });

  // Handle incoming data from the browser client
  ws.on('message', (message, isBinary) => {
    if (isBinary) {
      // Forward raw binary PCM/WebM/ogg audio data to Deepgram
      if (deepgramOpen && deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(message);
      }
    } else {
      // Handle control message (e.g. stop signal)
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'stop') {
          console.log('[Server] Client sent stop signal. Closing stream.');
          if (deepgramWs.readyState === WebSocket.OPEN) {
            deepgramWs.send(JSON.stringify({ type: 'CloseStream' }));
          }
        }
      } catch (err) {
        // Ignore malformed text messages
      }
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[Server] Client disconnected: code=${code}, reason=${reason}`);
    deepgramOpen = false;
    if (deepgramWs.readyState === WebSocket.OPEN) {
      try {
        deepgramWs.send(JSON.stringify({ type: 'CloseStream' }));
      } catch (e) {}
      deepgramWs.close();
    }
  });

  ws.on('error', (err) => {
    console.error('[Server] Client websocket error:', err.message);
    if (deepgramWs.readyState === WebSocket.OPEN) {
      deepgramWs.close();
    }
  });
});
