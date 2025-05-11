const axios = require('axios');
require('dotenv').config();
const http = require('http');
const https = require('https');

// Create custom axios instance with keepalive settings
const api = axios.create({
  timeout: 10000, // 10 second timeout
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024 // 50MB
});

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

// Track request statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastSuccess: null,
  lastError: null,
  consecutiveFailures: 0
};

// Function to send the message with exponential backoff
async function sendMessage() {
  try {
    stats.totalRequests++;
    const timestamp = new Date().toISOString();
    
    // Add a unique parameter to prevent caching
    const uniqueMessage = {
      ...message,
      timestamp: Date.now()
    };
    
    const response = await api.post(WEBHOOK_URL, uniqueMessage);
    
    stats.successfulRequests++;
    stats.lastSuccess = timestamp;
    stats.consecutiveFailures = 0;
    
    console.log(`[${timestamp}] Message sent successfully. Status: ${response.status}`);
  } catch (error) {
    stats.failedRequests++;
    stats.consecutiveFailures++;
    
    const timestamp = new Date().toISOString();
    stats.lastError = timestamp;
    
    console.error(`[${timestamp}] Error sending message:`, error.message);
    
    // If there's a response from the server
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    
    // If we have too many consecutive failures, implement a longer pause
    if (stats.consecutiveFailures > 5) {
      const backoffTime = Math.min(30000, 1000 * Math.pow(2, stats.consecutiveFailures - 5));
      console.log(`Too many consecutive failures (${stats.consecutiveFailures}). Backing off for ${backoffTime}ms`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
}

// Function to ensure the interval keeps running
let intervalId = null;

function ensureInterval() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  console.log(`Starting/restarting message sending to ${WEBHOOK_URL} every ${INTERVAL_MS}ms...`);
  sendMessage(); // Send first message immediately
  intervalId = setInterval(sendMessage, INTERVAL_MS);
}

// Start the interval
ensureInterval();

// Set up a watchdog to make sure our interval is still running
setInterval(() => {
  const now = Date.now();
  const lastActivity = stats.lastSuccess ? new Date(stats.lastSuccess).getTime() : 0;
  
  // If no successful requests in the last 2 minutes, restart the interval
  if (now - lastActivity > 120000) {
    console.log('No successful requests in the last 2 minutes. Restarting interval...');
    ensureInterval();
  }
}, 60000); // Check every minute

// Create a simple HTTP server to satisfy Render's port binding requirement
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Signal spammer is running' }));
  } else if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...stats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/restart') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    ensureInterval();
    res.end(JSON.stringify({
      status: 'restarted',
      message: 'Signal spammer interval restarted',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      message: 'Signal spammer is active',
      target: WEBHOOK_URL,
      interval: `${INTERVAL_MS}ms`,
      stats: {
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.failedRequests,
        lastSuccess: stats.lastSuccess,
        uptime: process.uptime()
      }
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Keep the service alive by preventing unhandled exceptions from crashing the app
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Don't exit, try to keep running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit, try to keep running
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  if (intervalId) {
    clearInterval(intervalId);
  }
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  if (intervalId) {
    clearInterval(intervalId);
  }
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Log memory usage periodically to help diagnose memory leaks
setInterval(() => {
  const used = process.memoryUsage();
  const usage = {};
  
  for (let key in used) {
    usage[key] = `${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`;
  }
  
  console.log('Memory usage:', usage);
}, 300000); // Every 5 minutes
