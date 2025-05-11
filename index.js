const axios = require('axios');
require('dotenv').config();

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://hook.finandy.com/yO3KJnXGQbpKnkbLrlUK';
const INTERVAL_MS = process.env.INTERVAL_MS || 2000; // 2 seconds by default

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

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});
