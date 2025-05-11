# Signal Spammer

A simple Node.js application that sends a predefined JSON payload to a webhook URL at regular intervals (every 2 seconds by default).

## Configuration

The application can be configured using environment variables:

- `WEBHOOK_URL`: The URL to send the payload to (default: https://hook.finandy.com/yO3KJnXGQbpKnkbLrlUK)
- `INTERVAL_MS`: The interval between requests in milliseconds (default: 2000)

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
