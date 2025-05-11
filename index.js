const axios = require('axios');
require('dotenv').config();
const http = require('http');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://hook.finandy.com/yO3KJnXGQbpKnkbLrlUK';
const INTERVAL_MS = process.env.INTERVAL_MS || 4000; // 4 seconds by default

// Message payload
const message = {
  "name": "Replayer",
  "secret": "e2kici7dcc",
  "symbol": "DOGEFDUSD",
  "side": "buy"
};

// Function to send the message
async function sendMessage() {
  try {
    const response = await axios.post(WEBHOOK_URL, message);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Message sent successfully. Status: ${response.status}`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error sending message:`, error.message);
    
    // If there's a response from the server
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  }
}

// Start sending messages at the specified interval
console.log(`Starting to send messages to ${WEBHOOK_URL} every ${INTERVAL_MS}ms...`);
sendMessage(); // Send first message immediately
setInterval(sendMessage, INTERVAL_MS);

// Create a simple HTTP server to satisfy Render's port binding requirement
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Signal spammer is running' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      message: 'Signal spammer is active',
      target: WEBHOOK_URL,
      interval: `${INTERVAL_MS}ms`
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
