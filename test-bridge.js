const WebSocket = require('ws');

const wsUrl = 'ws://localhost:3001';
console.log(`🔌 Attempting to connect to WS server at ${wsUrl}...`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server successfully!');
  console.log('Sending a test text message (stop signal) to the server...');
  ws.send(JSON.stringify({ type: 'stop' }));
});

ws.on('message', (data) => {
  console.log(`📩 Received message from server: ${data.toString()}`);
});

ws.on('close', (code, reason) => {
  console.log(`❌ Connection closed: code=${code}, reason=${reason.toString()}`);
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('💥 Connection error:', err.message);
  process.exit(1);
});

// Auto-terminate after 5 seconds
setTimeout(() => {
  console.log('⏰ Test timed out. Closing client connection...');
  ws.close();
}, 5000);
