# Signal Spammer

A robust Node.js application that sends a predefined JSON payload to a webhook URL at regular intervals (every 4 seconds by default). Built with reliability features to ensure continuous operation even in challenging environments.

## Configuration

The application can be configured using environment variables:

- `WEBHOOK_URL`: The URL to send the payload to (default: https://hook.finandy.com/yO3KJnXGQbpKnkbLrlUK)
- `INTERVAL_MS`: The interval between requests in milliseconds (default: 4000)
- `PORT`: The port for the HTTP server to listen on (default: 3000)

## Reliability Features

This application includes several features to ensure it keeps running reliably:

1. **Automatic Recovery**: The application monitors its own health and automatically restarts the sending interval if no successful requests are detected for 2 minutes.

2. **Exponential Backoff**: If multiple consecutive failures occur, the application will implement exponential backoff to avoid overwhelming the target server.

3. **HTTP Endpoints**:
   - `/` - Basic status information
   - `/health` - Simple health check endpoint
   - `/stats` - Detailed statistics about requests and memory usage
   - `/restart` - Manually trigger a restart of the sending interval

4. **Error Handling**: Comprehensive error handling prevents the application from crashing due to network issues or other errors.

5. **Memory Monitoring**: Periodic logging of memory usage helps identify potential memory leaks.

6. **Connection Management**: Uses HTTP keep-alive connections for better performance and reliability.

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your configuration (see above)
4. Run the application:
   ```
   npm start
   ```

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the environment variables in the Render dashboard
5. Deploy the service

## Message Format

The application sends the following JSON payload:

```json
{
  "name": "Replayer",
  "secret": "e2kici7dcc",
  "symbol": "DOGEFDUSD",
  "side": "buy"
}
```
